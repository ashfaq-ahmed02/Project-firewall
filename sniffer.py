from scapy.all import sniff, IP, TCP
from port_filter import check_port


def capture(packet):

    # Check if packet has IP and TCP layers
    if packet.haslayer(IP) and packet.haslayer(TCP):

        ip = packet[IP].src
        port = packet[TCP].dport

        check_port(ip, port)


print("Firewall started...")
print("Listening for packets...\n")

sniff(prn=capture, store=False)