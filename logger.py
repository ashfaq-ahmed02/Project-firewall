import sqlite3

def save_log(ip, port, action):

    conn = sqlite3.connect("firewall_logs.db")

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip TEXT,
        port INTEGER,
        action TEXT
    )
    """)

    cursor.execute(
        "INSERT INTO logs (ip, port, action) VALUES (?, ?, ?)",
        (ip, port, action)
    )

    conn.commit()

    conn.close()

    print("Saved in database")