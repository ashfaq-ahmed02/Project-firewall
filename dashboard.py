from flask import Flask, render_template, jsonify, request
from database import get_connection

app = Flask(__name__)


@app.route("/")
def home():

    conn = get_connection()
    cursor = conn.cursor()

    search = request.args.get("search", "")
    action = request.args.get("action", "All Logs")

    query = "SELECT id, ip, port, action, created_at FROM logs WHERE 1=1"
    values = []

    if search:
        query += " AND ip LIKE %s"
        values.append(f"%{search}%")

    if action == "BLOCKED":
        query += " AND action='BLOCKED'"

    elif action == "ALLOWED":
        query += " AND action='ALLOWED'"

    query += " ORDER BY id DESC"

    cursor.execute(query, values)
    logs = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) FROM logs")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE action='BLOCKED'")
    blocked = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE action='ALLOWED'")
    allowed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT ip) FROM logs")
    unique_ips = cursor.fetchone()[0]
    # AI Threat Analysis

    if blocked < 100:
        ai_level = "LOW"
        ai_status = "Network is Stable"

    elif blocked < 1000:
        ai_level = "MEDIUM"
        ai_status = "Suspicious Activity Detected"

    else:
        ai_level = "HIGH"
        ai_status = "Possible Attack Detected"

    blocked_percent = round((blocked / total) * 100, 2) if total else 0

    if blocked <= 20:
        threat_level = "LOW"
    elif blocked <= 50:
        threat_level = "MEDIUM"
    else:
        threat_level = "HIGH"

    cursor.execute("""
    SELECT port, COUNT(*)
    FROM logs
    WHERE action='BLOCKED'
    GROUP BY port
    ORDER BY COUNT(*) DESC
    LIMIT 5
    """)

    blocked_ports = cursor.fetchall()

    cursor.execute("""
    SELECT ip, COUNT(*)
    FROM logs
    GROUP BY ip
    ORDER BY COUNT(*) DESC
    LIMIT 5
    """)

    top_ips = cursor.fetchall()
    conn.close()

    return render_template(
        "index.html",
        logs=logs,
        top_ips=top_ips,
        total=total,
        blocked=blocked,
        allowed=allowed,
        unique_ips=unique_ips,
        blocked_ports=blocked_ports,
        blocked_percent=blocked_percent,
        search=search,
        threat_level=threat_level,
        action=action
    )
from flask import jsonify

@app.route("/api/logs")
def api_logs():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, ip, port, action, created_at
    FROM logs
    ORDER BY id DESC
    LIMIT 10
    """)

    logs = cursor.fetchall()

    conn.close()

    data = []

    for log in logs:

        data.append({
            "id": log[0],
            "ip": log[1],
            "port": log[2],
            "action": log[3],
            "time": str(log[4])
        })

    return jsonify(data)

if __name__ == "__main__":
    @app.route("/api/stats")
    def api_stats():

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM logs")
        total = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM logs WHERE action='BLOCKED'")
        blocked = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM logs WHERE action='ALLOWED'")
        allowed = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT ip) FROM logs")
        unique_ips = cursor.fetchone()[0]

        conn.close()

        return jsonify({
            "total": total,
            "blocked": blocked,
            "allowed": allowed,
            "unique_ips": unique_ips,

            "ai_status": ai_status,
            "ai_level": ai_level
        })

    app.run(debug=True)


    @app.route("/api/logs")
    def api_logs():

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT id, ip, port, action, time
            FROM logs
            ORDER BY id DESC
            LIMIT 10
        """)

        logs = cursor.fetchall()
        conn.close()

        data = []

        for log in logs:
            data.append({
                "id": log[0],
                "ip": log[1],
                "port": log[2],
                "action": log[3],
                "time": log[4]
            })

        return jsonify(data)