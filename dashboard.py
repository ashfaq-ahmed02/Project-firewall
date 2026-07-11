from flask import Flask, render_template, request
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


if __name__ == "__main__":
    app.run(debug=True)