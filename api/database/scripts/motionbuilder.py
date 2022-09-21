import sys
import threading
import urllib
import json
import socket
from time import time, sleep

import telnetlib

# Motionbuilder Telnet Port : 4242


def sendCommand(mbHost, command):
    mbHost.read_until(b'>>>', .01)
    mbHost.write(command)


def launch(start, stop, ip, port, takename):
    mbHost = telnetlib.Telnet(str(ip), port)

    sendCommand(mbHost, b"lPlayer = FBPlayerControl()\n")
    sleep(1)

    if start is True:
        sendCommand(
            mbHost, b"FBSystem().CurrentTake.CopyTake('{}')\n".format(takename))
        sleep(1)
        sendCommand(mbHost, b"lPlayer.Record(True)\n")
        sleep(1)
        sendCommand(mbHost, b"lPlayer.Play(False)\n")
        print("OK")

    if stop is True:
        #sendCommand(mbHost, b"if lPlayer.IsRecording:\n\tlPlayer.Record()\n")
        sendCommand(mbHost, b"if lPlayer.IsRecording:\n\tlPlayer.Stop()\n")
        print("OK")

    mbHost.close()


def usage():
    print("""Usage: python motionbuilder.py [options]
Options:
    --start
    --stop
    -i | --ip(IP of destination)
    -p | --port(destination port)
    -t | --takename
    -h | --help(this message)
Example: python motionbuilder.py --start --ip='192.168.1.102' --port='4242' --takename 'take001'""")


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
