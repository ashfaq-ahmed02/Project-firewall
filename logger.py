import datetime
from database import query_db

def save_log(ip, port, action):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sql = """
    INSERT INTO logs(ip, port, action, created_at)
    VALUES(%s, %s, %s, %s)
    """
    query_db(sql, (ip, port, action, timestamp), commit=True)
    print(f"Saved -> {ip}:{port} ({action})")