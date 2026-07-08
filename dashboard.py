from flask import Flask, render_template
import sqlite3

app = Flask(__name__)

@app.route("/")
def home():

    conn = sqlite3.connect("firewall_logs.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM logs")
    logs = cursor.fetchall()

    cursor.execute("SELECT COUNT(*) FROM logs")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE action='BLOCKED'")
    blocked = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM logs WHERE action='ALLOWED'")
    allowed = cursor.fetchone()[0]

    conn.close()

    return render_template(
        "index.html",
        logs=logs,
        total=total,
        blocked=blocked,
        allowed=allowed
    )

app.run(debug=True)