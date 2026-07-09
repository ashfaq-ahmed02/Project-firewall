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

    conn.close()

    return render_template(
        "index.html",
        logs=logs,
        total=total,
        blocked=blocked,
        allowed=allowed,
        unique_ips=unique_ips,
        blocked_percent=blocked_percent,
        search=search,
        action=action
    )


if __name__ == "__main__":
    app.run(debug=True)