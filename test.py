import sqlite3

conn = sqlite3.connect("firewall_logs.db")
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print("Tables:", cursor.fetchall())

cursor.execute("SELECT * FROM logs")
print("Rows:", cursor.fetchall())

conn.close()