from scapy.all import sniff

def capture(packet):
    print(packet.summary())

sniff(prn=capture, count=10)