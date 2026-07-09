from database import get_connection


def save_log(ip, port, action):

    conn = get_connection()
    cursor = conn.cursor()

    sql = """
    INSERT INTO logs(ip, port, action)
    VALUES(%s, %s, %s)
    """

    cursor.execute(sql, (ip, port, action))

    conn.commit()
    conn.close()

    print(f"Saved -> {ip}:{port} ({action})")