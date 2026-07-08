from flask import Flask, render_template
import sqlite3

app = Flask(__name__)

@app.route("/")
def home():

    conn = sqlite3.connect("firewall_logs.db")
    cursor = conn.cursor()

    # Get all logs
    cursor.execute("SELECT id, ip, port, action FROM logs")
    logs = cursor.fetchall()

    # Statistics
    cursor.execute("SELECT COUNT(*) FROM logs")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE action='BLOCKED'")
    blocked = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE action='ALLOWED'")
    allowed = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(DISTINCT ip) FROM logs")
    unique_ips = cursor.fetchone()[0]

    if total == 0:
        blocked_percent = 0
    else:
        blocked_percent = round((blocked / total) * 100, 2)

    conn.close()

    return render_template(
        "index.html",
        logs=logs,
        total=total,
        blocked=blocked,
        allowed=allowed,
        unique_ips=unique_ips,
        blocked_percent=blocked_percent
    )

if __name__ == "__main__":
    app.run(debug=True)