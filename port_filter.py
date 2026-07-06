from scapy.all import sniff

allowed_ports = [80, 443]

def check_packet(packet):

    # Check if packet has TCP layer
    if packet.haslayer("TCP"):

        port = packet["TCP"].dport

        if port in allowed_ports:
            print("ALLOWED:", port)

        else:
            print("BLOCKED:", port)

# Start sniffing packets
sniff(prn=check_packet)
