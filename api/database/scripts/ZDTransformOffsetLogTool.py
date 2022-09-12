import sys
import threading
import urllib
import urllib2
import json
import socket


def launch(start, stop, url, port, takename):
    if start is True:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  # UDP

        sock.sendto(takename, (url, port))

        print ("OK")

# script doesn't have a stop function
    if stop is True:
        return


def usage():
    print("""Usage: ./ZDTransformOffsetLog [options]
Options:
    --start
    --stop
    -u | --url(URL of destination)
    -t | --takename
    -h | --help(this message)
Example: python ZDTransformOffsetLog --start --url='192.168.1.102' --port='6000' --takename 'prise001'"""
)

def main(argv):
    try:
        opts, args = getopt.getopt(
            argv, "u:h:p:t", ["url=", "port=", "help", "start", "stop", "takename="])
    except getopt.GetoptError:
        usage()
        sys.exit(2)

    port = None
    takename = None
    start = False
    stop = False
    url = None
    # defaults
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-u", "--url"):
            url = arg
        elif opt in ("-p", "--port"):
            port = int(arg)
        elif opt in ("-t", "--takename"):
            takename = arg
        elif opt == "--start":
            start = True
        elif opt == "--stop":
            stop = True

    if url is None or port is None or start + stop != 1 or takename is None:
        print (url)
        print (port)
        print (start)
        print (stop)
        print (takename)
        usage()
        sys.exit()
    else:
        launch(start, stop, url, port, takename)


if __name__ == "__main__":
    import getopt
    main(sys.argv[1:])
