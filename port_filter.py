from logger import save_log

allowed_ports = [80, 443]


def check_port(ip, port):

    if port in allowed_ports:
        action = "ALLOWED"
    else:
        action = "BLOCKED"

    print(ip, port, action)

    save_log(ip, port, action)