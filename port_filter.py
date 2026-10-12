from logger import save_log
from database import query_db

DEFAULT_ALLOWED_PORTS = [80, 443]

def check_port(ip, port):
    """
    Checks incoming packet against firewall rules in database.
    Falls back to default allowed ports (80, 443) if rule not specified.
    """
    try:
        # Check if IP is explicitly blocked
        blocked_ip = query_db("SELECT id FROM rules WHERE rule_type='IP' AND target=%s AND action='BLOCKED'", (ip,), one=True)
        if blocked_ip:
            save_log(ip, port, "BLOCKED")
            return "BLOCKED"

        # Check if Port rule exists in DB
        port_rule = query_db("SELECT action FROM rules WHERE rule_type='PORT' AND target=%s", (str(port),), one=True)
        if port_rule:
            action = port_rule[0]
            save_log(ip, port, action)
            return action
    except Exception as e:
        print(f"Rule lookup fallback: {e}")

    # Fallback default rule
    if int(port) in DEFAULT_ALLOWED_PORTS:
        action = "ALLOWED"
    else:
        action = "BLOCKED"

    print(f"Firewall Decision -> {ip}:{port} [{action}]")
    save_log(ip, port, action)
    return action