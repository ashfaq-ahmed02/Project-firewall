import os
import sqlite3
import datetime
from datetime import timedelta
import random

DB_FILE = os.path.join(os.path.dirname(__file__), "firewall_logs.db")
_db_type = "sqlite"

def get_connection():
    global _db_type
    
    # If user explicitly enables MySQL via environment variable, try MySQL first
    if os.environ.get("USE_MYSQL", "false").lower() in ("1", "true", "yes"):
        try:
            import mysql.connector
            conn = mysql.connector.connect(
                host=os.environ.get("DB_HOST", "localhost"),
                user=os.environ.get("DB_USER", "root"),
                password=os.environ.get("DB_PASSWORD", "Ashfaq2006"),
                database=os.environ.get("DB_NAME", "firewall_db"),
                connection_timeout=2
            )
            _db_type = "mysql"
            return conn
        except Exception as e:
            print(f"[Warning] MySQL connection error ({e}). Falling back to SQLite.")

    # High-performance zero-config SQLite default
    _db_type = "sqlite"
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    return conn

def get_db_type():
    return _db_type

def query_db(query, params=(), one=False, commit=False):
    conn = get_connection()
    db_type = get_db_type()
    cursor = conn.cursor()

    # Normalize placeholders: if SQLite, replace %s with ?
    if db_type == "sqlite":
        normalized_query = query.replace("%s", "?")
    else:
        normalized_query = query

    try:
        cursor.execute(normalized_query, params)
        if commit:
            conn.commit()
            last_id = cursor.lastrowid
            conn.close()
            return last_id
        
        result = cursor.fetchall()
        conn.close()
        return (result[0] if result else None) if one else result
    except Exception as e:
        conn.close()
        raise e

def init_db():
    conn = get_connection()
    c = conn.cursor()
    db_type = get_db_type()

    if db_type == "sqlite":
        c.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT NOT NULL,
            port INTEGER NOT NULL,
            action TEXT NOT NULL,
            created_at TEXT
        )
        """)
        
        # Check if created_at column exists
        c.execute("PRAGMA table_info(logs)")
        cols = [r[1] for r in c.fetchall()]
        if "created_at" not in cols:
            c.execute("ALTER TABLE logs ADD COLUMN created_at TEXT")
            c.execute("UPDATE logs SET created_at = datetime('now') WHERE created_at IS NULL")

        c.execute("""
        CREATE TABLE IF NOT EXISTS rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            rule_type TEXT NOT NULL,
            target TEXT NOT NULL,
            action TEXT NOT NULL,
            description TEXT,
            created_at TEXT
        )
        """)
        conn.commit()

        # Seed initial rules if empty
        c.execute("SELECT COUNT(*) FROM rules")
        if c.fetchone()[0] == 0:
            default_rules = [
                ("PORT", "80", "ALLOWED", "Standard HTTP web traffic", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                ("PORT", "443", "ALLOWED", "Secure HTTPS encrypted traffic", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                ("PORT", "22", "BLOCKED", "SSH Remote Shell protection", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                ("PORT", "3389", "BLOCKED", "RDP Remote Desktop access", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                ("IP", "185.220.101.5", "BLOCKED", "Known Tor Exit Relay / Scanner", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
                ("IP", "45.154.255.89", "BLOCKED", "Repeated brute force attacker", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
            ]
            for r in default_rules:
                c.execute("INSERT INTO rules (rule_type, target, action, description, created_at) VALUES (?, ?, ?, ?, ?)", r)
            conn.commit()

        # Seed initial logs if fewer than 15 rows exist
        c.execute("SELECT COUNT(*) FROM logs")
        count = c.fetchone()[0]
        if count < 15:
            seed_data = [
                ("192.168.1.105", 443, "ALLOWED", 120),
                ("142.250.190.46", 443, "ALLOWED", 115),
                ("185.220.101.5", 22, "BLOCKED", 110),
                ("192.168.1.105", 80, "ALLOWED", 98),
                ("45.154.255.89", 3389, "BLOCKED", 92),
                ("103.203.57.18", 8080, "BLOCKED", 85),
                ("172.217.16.206", 443, "ALLOWED", 78),
                ("198.51.100.24", 23, "BLOCKED", 70),
                ("10.0.0.45", 443, "ALLOWED", 65),
                ("192.168.1.5", 22, "BLOCKED", 55),
                ("203.0.113.195", 21, "BLOCKED", 48),
                ("192.168.1.25", 80, "BLOCKED", 40),
                ("10.196.55.251", 9784, "BLOCKED", 30),
                ("151.101.65.140", 443, "ALLOWED", 22),
                ("91.240.118.232", 445, "BLOCKED", 15),
                ("192.168.1.108", 443, "ALLOWED", 8),
                ("185.191.171.12", 22, "BLOCKED", 2),
            ]
            now = datetime.datetime.now()
            for ip, port, action, mins_ago in seed_data:
                timestamp = (now - timedelta(minutes=mins_ago)).strftime("%Y-%m-%d %H:%M:%S")
                c.execute("INSERT INTO logs (ip, port, action, created_at) VALUES (?, ?, ?, ?)", (ip, port, action, timestamp))
            conn.commit()

    conn.close()

# Auto-initialize DB on load
init_db()