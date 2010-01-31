#!/usr/bin/env python

from random import randint
from time import strftime
from optparse import OptionParser
from time import sleep
from sys import stdout
import signal
import re
import mpd
import copy

client = mpd.MPD('zoidberg', 6600)

def cadence():
    report("launching cadence")

    signal.signal(signal.SIGTERM, closing)

    main()

def main():
    # playmode
    #
    # 0 - continuous (play albums in alphabetical order)
    # 1 - random (play albums at complete random)
    # 2 - shuffle (play albums at random but don't repeat an album until all other albums have been played)
    play_mode = 2
    albums = getAlbums()
    shuffle = copy.deepcopy(albums)
    updating = False
    next = 0

    while 1:
        #if mpd is updating then update our db as soon is it stops
        if 'updating_db' in client.status():
            if not updating:
                report("mpd is updating! Updating local db soon")
                updating = True
        else:
            if updating:
                albums = getAlbums()
                updating = False

        #if mpc is stopped clear the playlist
        if client.status()['state'] == 'stop':
            client.clear()
        else:
            #remove old tracks, keep the last 3
            if client.currentsong()['pos'] > 3:
                for i in range(0, int(client.currentsong()['pos']) - 3):
                    client.delete(0)

        #we want at least 1 track in the playlist
        if len(client.playlist()) <= 1:
            album = ""
            tracks = []
            #add an album
            if play_mode == 1:
                #random
                album = albums[randint(0, len(albums)-1)]
            elif play_mode == 2:
                #shuffle
                if len(shuffle) == 0:
                    shuffle = copy.deepcopy(albums)
                album = shuffle.keys()[randint(0, len(shuffle.keys())-1)]
                tracks = shuffle.pop(album)
            else:
                #continuous
                if next == len(albums):
                    next = 0;
                album = albums[next]
                next += 1
    
            report("adding: "+album)
            for i in tracks:
                print i
                client.add(i);

        #if mpc is stopped start it playing
        if client.status()['state'] == 'stop':
            client.play()

        sleep(1);

#find albums in mpd library
#this assumes a folder structure of "^albums/(artist)/(album)/.*(.mp3|.flac|etc)"
def getAlbums():
    "returns all songs from the mpd database"
    albums={}

    report("updating local db")

    data = ""
    pattern = re.compile('(albums/.*/(.*)/.*\.(mp3|flac))')

    data = client.listall()
    
    for i in data:
        if i[0] is 'file':
            f = pattern.match(i[1])
            if f:
                if f.group(1) not in albums:
                    albums[f.group(1)] = []
                albums[f.group(1)].append(f.group(0))

    report("completed updating db")

    return albums

def report(text):
    stdout.write("%s: %s\n" % (strftime("%Y-%m-%d %H:%M:%S"), text))
    stdout.flush()

def closing():
    report("recieved sigterm signal...")
