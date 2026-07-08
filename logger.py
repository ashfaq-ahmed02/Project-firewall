import sqlite3
from datetime import datetime

def save_log(ip, port, action):

    conn = sqlite3.connect("firewall_logs.db")
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS logs(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        port INTEGER,
        action TEXT,
        time TEXT
    )
    """)

    current_time = datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    cursor.execute(
        "INSERT INTO logs(ip,port,action,time) VALUES(?,?,?,?)",
        (ip, port, action, current_time)
    )

    conn.commit()
    conn.close()

    print("Saved:", ip)