import socket
import json


def start(takename):
    print("Starting with takename " + takename)
    # TODO


def stop():
    print("Stopping")
    # TODO


UDP_IP = "127.0.0.1"
UDP_PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

while True:
    data, addr = sock.recvfrom(1024)

    payload = json.loads(data)
    print(payload["timestamp"])

    if (payload["action"] == "start"):
        start(payload["takename"])
    elif (payload["action"] == "stop"):
        stop()
