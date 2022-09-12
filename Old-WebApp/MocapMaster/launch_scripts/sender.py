import sys
import threading
import urllib
import urllib2
import json
import socket
from time import time


def launch(start, stop, ip, port, takename):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  # UDP
    start_timer = time()

    if start is True:
        message = '{"action": "start", "takename": "' + \
            takename + '", "timestamp": "' + str(start_timer) + '"}'
        sock.sendto(message.encode("utf-8"), (ip, port))
        print("OK")

    if stop is True:
        message = '{"action": "stop", "timestamp": "' + str(start_timer) + '"}'
        sock.sendto(message.encode("utf-8"), (ip, port))

        print("OK")


def usage():
    print"""Usage: python sample.py [options]
Options:
    --start
    --stop
    -i | --ip(IP of destination)
    -p | --port(destination port)
    -t | --takename
    -h | --help(this message)
Example: python sample.py --start --ip='192.168.1.102' --port='6000' --takename 'take001'"""


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
