from flask import Flask, render_template
import sqlite3

app = Flask(__name__)

@app.route("/")
def home():

    conn = sqlite3.connect("firewall_logs.db")
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM logs")

    logs = cursor.fetchall()

    conn.close()

    return render_template("index.html", logs=logs)

app.run(debug=True)