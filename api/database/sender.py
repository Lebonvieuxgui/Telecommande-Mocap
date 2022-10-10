from pythonosc.udp_client import SimpleUDPClient
from pythonosc import osc_message_builder
import socket
import OSC


ip = "192.168.1.204"
port = 8000
bufferSize = 1024

client = SimpleUDPClient(ip, port)  # Create client

msg = osc_message_builder.OscMessageBuilder(address = ip)
msg.add_arg("/VideoDisplayOn", arg_type="s")
client.send_message("192.168.1.204:8000", "/VideoDisplayOn")   # Send float message
msg = msg.build()
client.send(msg)   # Send float message
