import os
import sys

import socket


#index = 0
#ip_list = ['192.168.1.202', '192.168.1.203', '192.168.1.204']
#for ip in ip_list:
#    index += 1
#    response = os.popen(f"ping {ip}").read()
#    if "n'a pas pu" or "perdus = 4" in response:
#        print(f"DOWN {ip} Ping {index} Unsuccessful")
#    else:
#        print(f"UP {ip} Ping {index} Successful")
#    print(response)

status = 0

def main(ip):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)         # Creates socket
    host = '192.168.1.25' # Enter the IP of the workstation here 
    port = 8000                # Select port which should be pinged
    try:
        s.connect((host, port))    # tries to connect to the host
        print("good")
        status = 1
    except socket.error: # if failed to connect
        sys.stdout.write("Server offline")    # server is offline
        status = -1
        return -1
    s.close()                      # close socket
    return 1

if __name__ == "__main__":
    import getopt
    main(sys.argv[1:])