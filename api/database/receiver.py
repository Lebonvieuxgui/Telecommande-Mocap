import socket

from pythonosc.udp_client import SimpleUDPClient
from pythonosc import osc_message_builder

ip = "192.168.128.204"
port = 8000
bufferSize = 1024

client = SimpleUDPClient(ip, port)  # Create client

msg = osc_message_builder.OscMessageBuilder(address = ip)
msg.add_arg("/VideoDisplayOn", arg_type='s')
msg = msg.build()
print(msg)
client.send(msg)





msgFromClient       = "/VideoDisplayOn"
bytesToSend         = str.encode(msgFromClient)
serverAddressPort   = ("192.168.128.204", 8000)
bufferSize          = 1024
# Create a UDP socket at client side
UDPClientSocket = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
# Send to server using created UDP socket
UDPClientSocket.sendto(bytesToSend, serverAddressPort)

#msgFromServer = UDPClientSocket.recvfrom(bufferSize)

#msg = "Message from Server {}".format(msgFromServer[0])

print(msg)
print('over')