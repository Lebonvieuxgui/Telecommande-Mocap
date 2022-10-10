import socket
import struct
from pythonosc.udp_client import SimpleUDPClient
from pythonosc import osc_message_builder
from typing import Tuple

localIP     = "192.168.128.192"
localPort   = 8000
bufferSize  = 1024
msgFromServer = "/VideoDisplayOn"
bytesToSend = msgFromServer.encode()
UDPServerSocket = socket.socket(family=socket.AF_INET, type=socket.SOCK_DGRAM)
UDPServerSocket.bind((localIP, localPort))
print("UDP server up and listening")

ip = "192.168.128.112"
port = 8000
bufferSize = 1024

client = SimpleUDPClient(ip, port)  # Create client

msg = osc_message_builder.OscMessageBuilder(address = ip)
msg.add_arg("/VideoDisplayOn", arg_type='s')
msg = msg.build()

while(True):

    #bytesAddressPair = UDPServerSocket.recvfrom(bufferSize)
    #message = bytesAddressPair[0]
    #address = bytesAddressPair[1]
    #clientMsg = "Message from Client:{}".format(message)
    #clientIP  = "Client IP Address:{}".format(address)
    #print(clientMsg)
    #print(clientIP)
    sendaddress = ('192.168.128.112', 8000)
    client.send(msg)
    UDPServerSocket.sendto(bytesToSend, sendaddress)
