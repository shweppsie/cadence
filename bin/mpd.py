import socket
import os

class MPD:
    def __init__(self, host, port):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((host, port))
        rec_buf = self.sock.recv(4096)
        if not rec_buf.startswith("OK MPD"):
            os.exit(1)

    def close(self):
        self.sock.close()

    def request(self, param):
        """makes a request to the mpd daemon"""
        """returns the data as an array of strings"""
        rec_buf = ""
        data = ""

        self.sock.send(param+'\n')
        while rec_buf.find("OK\n") == -1:
            rec_buf = self.sock.recv(4096)
            data += rec_buf
        
        """return the data without the OK"""
        return data.split('\n')[:-2]

    def delimit(self, data, result):
        for i in data:
            j = i.split(':')
            if type(result) is list:
                result.append((j[0].lower(), j[1].strip()))
            elif type(result) is dict:
                result[j[0].lower()] = j[1].strip()
        return result

    def listall(self):
        return self.delimit(self.request('listall'), [])

    def status(self):
        return self.delimit(self.request('status'), {})

    def currentsong(self):
        return self.delimit(self.request('currentsong'), {})

    def playlist(self):
        return self.delimit(self.request('playlist'), {})

    def play(self):
        self.request('play')

    def clear(self):
        self.request('clear')

    def add(self, track):
        self.request('add \"%s\"' % track)

    def delete(self, track):
        self.request('delete %s' % track)

if __name__=="__main__":
    print "testing..."
    i = MPD('zoidberg', 6600)
    #print i.listall()
    print i.status()
    print i.currentsong()
    i.close()
