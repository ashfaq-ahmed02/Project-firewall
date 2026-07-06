blocked_ips = ["192.168.1.5"]

def check_packet(packet):
    source = packet["IP"].src

    if source in blocked_ips:
        print("BLOCKED:", source)
    else:
        print("ALLOWED:", source)