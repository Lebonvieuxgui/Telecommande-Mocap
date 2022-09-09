import sys
import os
import threading
import urllib
import json
import socket
import requests

# Unreal default HTTP Port : 30010

def launch(start, stop, ip, port, takename, projectname):

    url = "http://{}:{}/remote/object/call".format(ip, port)
    payload = {
        "objectPath" : "/Script/{}.Default__MyTakeRecorderController".format(projectname),
        "generateTransaction" : True
    }

    if start is True:
        payload["functionName"] = "StartRecording"
        payload["parameters"] = { "InSlate" : takename }
        requests.put(url, json = payload)

    if stop is True:
        payload["functionName"] = "StopRecording"
        requests.put(url, json = payload)


def usage():
    print("""Usage: python livelinkface.py [options]
Options:
    --start
    --stop
    -i | --ip(IP of destination)
    -p | --port(destination port)
    -t | --takename
    -n | --projectname
    -h | --help(this message)
Example: python unreal.py --start --ip='192.168.1.102' --port='30010' --takename 'take001' --projectname='FaceARSample' """)
    

def main(argv):
    try:
        opts, args = getopt.getopt(
            argv, "i:h:p:t:n", ["ip=", "port=", "help", "start", "stop", "takename=", "projectname="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    port = None
    takename = None
    projectname = None
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
        elif opt in ("-n", "--projectname"):
            projectname = arg
        elif opt == "--start":
            start = True
        elif opt == "--stop":
            stop = True

    if ip is None or port is None or start + stop != 1 or (takename is None and start == True) or projectname is None:
        usage()
        sys.exit()
    else:
        launch(start, stop, ip, port, takename, projectname)


if __name__ == "__main__":
    import getopt
    main(sys.argv[1:])
