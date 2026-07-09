import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Ashfaq2006",
        database="firewall_db"
    )