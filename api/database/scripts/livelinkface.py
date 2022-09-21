import sys
import os
import threading
import urllib
import json
import socket
from time import time

from pythonosc.udp_client import SimpleUDPClient
# Default OSC Port : 8000

def launch(start, stop, ip, port, takename):
    #ip.replace(' ', '')
    ip = ip.split('/')

    if start is True:
        for i in ip:
            print(i)
            c = SimpleUDPClient(i, port)
            msg = ["/RecordStart"]
            msg.append(takename)
            msg.append(0)
            c.send_message(i, msg)
            print("Sent " + str(msg) + " to " + i)

    if stop is True:
        for i in ip:
            c = SimpleUDPClient(i, port)
            msg = ["/RecordStop"]
            msg.append(0)
            c.send_message(i, msg)
            print("Sent " + str(msg) + " to " + i)


def usage():
    print("""Usage: python livelinkface.py [options]
Options:
    --start
    --stop
    -i | --ip(IP of destination)
    -p | --port(destination port)
    -t | --takename
    -h | --help(this message)
Example: python livelinkface.py --start --ip='192.168.1.102' --port='8000' --takename='take001'""")


def main(argv):
    try:
        opts, args = getopt.getopt(
            argv, "i:h:p:t", ["ip=", "port=", "help", "start", "stop", "takename="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    port = None
    takename = None
    start = False
    stop = False
    ip = None
    # defaults
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-i", "--ip"):
            ip = arg
        elif opt in ("-p", "--port"):
            port = int(arg)
        elif opt in ("-t", "--takename"):
            takename = arg
        elif opt == "--start":
            start = True
        elif opt == "--stop":
            stop = True

    if ip is None or port is None or start + stop != 1 or (takename is None and start == True):
        usage()
        sys.exit()
    else:
        launch(start, stop, ip, port, takename)


if __name__ == "__main__":
    import getopt
    main(sys.argv[1:])
