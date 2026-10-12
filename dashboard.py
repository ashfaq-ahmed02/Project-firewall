import os
import io
import csv
import random
import datetime
from flask import Flask, render_template, jsonify, request, Response
from database import query_db, get_db_type, init_db
from port_filter import check_port

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

# GeoIP dictionary for demo/threat-map geolocation
GEO_IP_LOOKUP = {
    "185.220.101.5": {"country": "Germany", "city": "Frankfurt", "lat": 50.1109, "lng": 8.6821},
    "45.154.255.89": {"country": "Russia", "city": "Moscow", "lat": 55.7558, "lng": 37.6173},
    "103.203.57.18": {"country": "Japan", "city": "Tokyo", "lat": 35.6762, "lng": 139.6503},
    "142.250.190.46": {"country": "United States", "city": "Mountain View", "lat": 37.3861, "lng": -122.0839},
    "172.217.16.206": {"country": "United States", "city": "Seattle", "lat": 47.6062, "lng": -122.3321},
    "151.101.65.140": {"country": "United States", "city": "San Francisco", "lat": 37.7749, "lng": -122.4194},
    "198.51.100.24": {"country": "United Kingdom", "city": "London", "lat": 51.5074, "lng": -0.1278},
    "91.240.118.232": {"country": "Netherlands", "city": "Amsterdam", "lat": 52.3676, "lng": 4.9041},
    "185.191.171.12": {"country": "France", "city": "Paris", "lat": 48.8566, "lng": 2.3522},
    "203.0.113.195": {"country": "Australia", "city": "Sydney", "lat": -33.8688, "lng": 151.2093},
    "114.119.160.10": {"country": "Singapore", "city": "Singapore", "lat": 1.3521, "lng": 103.8198},
    "177.136.240.50": {"country": "Brazil", "city": "São Paulo", "lat": -23.5505, "lng": -46.6333},
}

def resolve_geo(ip):
    if ip in GEO_IP_LOOKUP:
        return GEO_IP_LOOKUP[ip]
    # Internal / Private IP ranges
    if ip.startswith("192.168.") or ip.startswith("10.") or ip.startswith("172.16.") or ip == "127.0.0.1":
        return {"country": "Local Network", "city": "Internal LAN", "lat": 28.6139, "lng": 77.2090} # default home region
    # Deterministic pseudo-location based on IP hash for unknown external IPs
    h = sum(ord(c) for c in ip)
    lat = ((h * 13) % 120) - 40
    lng = ((h * 29) % 320) - 160
    return {"country": "External Host", "city": "Remote Node", "lat": lat, "lng": lng}

# ===========================
# Home Page
# ===========================
@app.route("/")
def home():
    init_db()

    total_row = query_db("SELECT COUNT(*) FROM logs", one=True)
    total = total_row[0] if total_row else 0

    blocked_row = query_db("SELECT COUNT(*) FROM logs WHERE action='BLOCKED'", one=True)
    blocked = blocked_row[0] if blocked_row else 0

    allowed_row = query_db("SELECT COUNT(*) FROM logs WHERE action='ALLOWED'", one=True)
    allowed = allowed_row[0] if allowed_row else 0

    unique_row = query_db("SELECT COUNT(DISTINCT ip) FROM logs", one=True)
    unique_ips = unique_row[0] if unique_row else 0

    blocked_percent = round((blocked / total) * 100, 1) if total > 0 else 0

    if blocked_percent >= 60:
        threat_level = "CRITICAL"
        ai_status = "Severe Port Scan & Unauthorized Ingress Detected"
        ai_level = "HIGH"
    elif blocked_percent >= 30:
        threat_level = "ELEVATED"
        ai_status = "Suspicious Multi-Port Probing Identified"
        ai_level = "MEDIUM"
    else:
        threat_level = "LOW"
        ai_status = "Network Traffic Normal - Firewall Rules Active"
        ai_level = "LOW"

    rules_count_row = query_db("SELECT COUNT(*) FROM rules", one=True)
    rules_count = rules_count_row[0] if rules_count_row else 0

    return render_template(
        "index.html",
        total=total,
        blocked=blocked,
        allowed=allowed,
        unique_ips=unique_ips,
        blocked_percent=blocked_percent,
        threat_level=threat_level,
        ai_status=ai_status,
        ai_level=ai_level,
        rules_count=rules_count,
        db_type=get_db_type()
    )

# ===========================
# API - Logs (Filtered & Paginated)
# ===========================
@app.route("/api/logs")
def api_logs():
    search = request.args.get("search", "").strip()
    action = request.args.get("action", "ALL").strip().upper()
    limit = int(request.args.get("limit", 20))

    query = "SELECT id, ip, port, action, created_at FROM logs WHERE 1=1"
    params = []

    if search:
        query += " AND (ip LIKE %s OR CAST(port AS TEXT) LIKE %s)"
        params.extend([f"%{search}%", f"%{search}%"])

    if action in ["BLOCKED", "ALLOWED"]:
        query += " AND action = %s"
        params.append(action)

    query += " ORDER BY id DESC LIMIT %s"
    params.append(limit)

    rows = query_db(query, tuple(params)) or []

    data = []
    for row in rows:
        data.append({
            "id": row[0],
            "ip": row[1],
            "port": row[2],
            "action": row[3],
            "time": str(row[4]) if row[4] else "Just now"
        })

    return jsonify(data)

# ===========================
# API - Dashboard Stats
# ===========================
@app.route("/api/stats")
def api_stats():
    total_row = query_db("SELECT COUNT(*) FROM logs", one=True)
    total = total_row[0] if total_row else 0

    blocked_row = query_db("SELECT COUNT(*) FROM logs WHERE action='BLOCKED'", one=True)
    blocked = blocked_row[0] if blocked_row else 0

    allowed_row = query_db("SELECT COUNT(*) FROM logs WHERE action='ALLOWED'", one=True)
    allowed = allowed_row[0] if allowed_row else 0

    unique_row = query_db("SELECT COUNT(DISTINCT ip) FROM logs", one=True)
    unique_ips = unique_row[0] if unique_row else 0

    threat_percent = round((blocked / total) * 100, 1) if total > 0 else 0

    if threat_percent >= 60:
        threat_level = "CRITICAL"
        threat_badge_color = "#ef4444"
        ai_status = "Active Infiltration Attempts Blocked"
        ai_level = "HIGH"
        recommendation = "Deploy IP subnet block on top offending actors & tighten ingress rules."
    elif threat_percent >= 30:
        threat_level = "ELEVATED"
        threat_badge_color = "#f59e0b"
        ai_status = "Elevated External Port Probing Detected"
        ai_level = "MEDIUM"
        recommendation = "Review SSH (Port 22) and Telnet (Port 23) access patterns."
    else:
        threat_level = "NORMAL"
        threat_badge_color = "#10b981"
        ai_status = "Perimeter Secure - Normal Traffic Flow"
        ai_level = "LOW"
        recommendation = "All firewall policies functioning within standard thresholds."

    # Top Blocked Ports
    top_ports_rows = query_db("""
        SELECT port, COUNT(*) as cnt
        FROM logs
        WHERE action='BLOCKED'
        GROUP BY port
        ORDER BY cnt DESC
        LIMIT 5
    """) or []
    top_ports = [{"port": r[0], "count": r[1]} for r in top_ports_rows]

    # Top Attacker IPs
    top_attackers_rows = query_db("""
        SELECT ip, COUNT(*) as cnt
        FROM logs
        WHERE action='BLOCKED'
        GROUP BY ip
        ORDER BY cnt DESC
        LIMIT 5
    """) or []
    top_attackers = []
    for r in top_attackers_rows:
        geo = resolve_geo(r[0])
        top_attackers.append({
            "ip": r[0],
            "count": r[1],
            "country": geo["country"]
        })

    # Recent Trend (last 10 logs status progression)
    recent_trend_rows = query_db("SELECT action FROM logs ORDER BY id DESC LIMIT 15") or []
    trend = [r[0] for r in reversed(recent_trend_rows)]

    return jsonify({
        "total": total,
        "blocked": blocked,
        "allowed": allowed,
        "unique_ips": unique_ips,
        "threat_score": threat_percent,
        "threat_level": threat_level,
        "threat_badge_color": threat_badge_color,
        "ai_status": ai_status,
        "ai_level": ai_level,
        "recommendation": recommendation,
        "top_ports": top_ports,
        "top_attackers": top_attackers,
        "trend": trend,
        "db_type": get_db_type().upper()
    })

# ===========================
# API - Threat Map Points
# ===========================
@app.route("/api/threat-map")
def api_threat_map():
    rows = query_db("""
        SELECT ip, port, action, COUNT(*) as hits
        FROM logs
        GROUP BY ip, action
        ORDER BY hits DESC
        LIMIT 25
    """) or []

    map_points = []
    for r in rows:
        ip, port, action, hits = r[0], r[1], r[2], r[3]
        geo = resolve_geo(ip)
        map_points.append({
            "ip": ip,
            "port": port,
            "action": action,
            "hits": hits,
            "country": geo["country"],
            "city": geo["city"],
            "lat": geo["lat"],
            "lng": geo["lng"]
        })

    return jsonify(map_points)

# ===========================
# API - Rules Management
# ===========================
@app.route("/api/rules", methods=["GET", "POST"])
def api_rules():
    if request.method == "GET":
        rows = query_db("SELECT id, rule_type, target, action, description, created_at FROM rules ORDER BY id DESC") or []
        rules = []
        for r in rows:
            rules.append({
                "id": r[0],
                "rule_type": r[1],
                "target": r[2],
                "action": r[3],
                "description": r[4],
                "created_at": str(r[5]) if r[5] else ""
            })
        return jsonify(rules)

    elif request.method == "POST":
        data = request.get_json(force=True)
        rule_type = data.get("rule_type", "PORT").upper()
        target = data.get("target", "").strip()
        action = data.get("action", "BLOCKED").upper()
        description = data.get("description", "Custom rule").strip()

        if not target:
            return jsonify({"error": "Target port or IP is required"}), 400

        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sql = "INSERT INTO rules (rule_type, target, action, description, created_at) VALUES (%s, %s, %s, %s, %s)"
        new_id = query_db(sql, (rule_type, target, action, description, now_str), commit=True)
        return jsonify({"success": True, "id": new_id, "message": "Rule successfully applied"})

@app.route("/api/rules/<int:rule_id>", methods=["DELETE"])
def delete_rule(rule_id):
    query_db("DELETE FROM rules WHERE id = %s", (rule_id,), commit=True)
    return jsonify({"success": True, "message": f"Rule {rule_id} removed"})

# ===========================
# API - Traffic Simulator
# ===========================
@app.route("/api/simulate", methods=["POST"])
def simulate_traffic():
    data = request.get_json(force=True) or {}
    sim_type = data.get("type", "port_scan")
    
    simulated_events = []

    if sim_type == "port_scan":
        attacker_ip = random.choice(["185.220.101.5", "45.154.255.89", "198.51.100.24", "103.203.57.18"])
        probed_ports = [21, 22, 23, 25, 3389, 8080, 445]
        for port in probed_ports:
            action = check_port(attacker_ip, port)
            simulated_events.append({"ip": attacker_ip, "port": port, "action": action})

    elif sim_type == "ssh_brute":
        attacker_ip = random.choice(["185.191.171.12", "91.240.118.232", "203.0.113.195"])
        for _ in range(5):
            action = check_port(attacker_ip, 22)
            simulated_events.append({"ip": attacker_ip, "port": 22, "action": action})

    elif sim_type == "normal_web":
        client_ip = f"192.168.1.{random.randint(10, 250)}"
        ports = [80, 443, 443, 443, 80]
        for p in ports:
            action = check_port(client_ip, p)
            simulated_events.append({"ip": client_ip, "port": p, "action": action})

    elif sim_type == "custom":
        custom_ip = data.get("ip", "192.168.1.99").strip()
        custom_port = int(data.get("port", 80))
        action = check_port(custom_ip, custom_port)
        simulated_events.append({"ip": custom_ip, "port": custom_port, "action": action})

    return jsonify({
        "success": True,
        "type": sim_type,
        "events": simulated_events,
        "message": f"Simulated {len(simulated_events)} packet events"
    })

# ===========================
# API - Export Logs (CSV)
# ===========================
@app.route("/api/export-logs")
def export_logs():
    rows = query_db("SELECT id, ip, port, action, created_at FROM logs ORDER BY id DESC") or []
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Log ID", "Source IP", "Destination Port", "Action Taken", "Timestamp"])
    for r in rows:
        writer.writerow([r[0], r[1], r[2], r[3], r[4]])
    
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=rushield_firewall_logs.csv"}
    )

# ===========================
# API - Clear Logs
# ===========================
@app.route("/api/clear-logs", methods=["POST"])
def clear_logs():
    query_db("DELETE FROM logs", commit=True)
    # Insert one starting record
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    query_db("INSERT INTO logs (ip, port, action, created_at) VALUES (%s, %s, %s, %s)",
             ("127.0.0.1", 443, "ALLOWED", now_str), commit=True)
    return jsonify({"success": True, "message": "Logs reset successfully"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)