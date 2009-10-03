#!/usr/bin/env python

from re import match
from random import randint
from time import strftime
from optparse import OptionParser
from mpd import MPDClient

client = MPDClient()
client.connect("localhost", 6600)

#find albums in mpd library
#this assumes a folder structure of "^albums/(artist)/(album)/.*(.mp3|.flac|etc)"
def getalbums():
        "returns all songs from the mpd database"
        client.iterate = True
        files = client.listallinfo()
        client.iterate = False

        #find albums and add them to the set
        albums = {}
        directory = ""
        for file in files:
            if 'directory' in file:
                directory = file['directory']
            if 'file' in file:
                i = match('^albums/.*/(.*)/.*\.(mp3|flac)', file['file'])
                if i is not None:
                    if 'album' in file:
                        album = file['album']
                        if isinstance(album, list):
                            album=album[0]
                        albums[album] = directory
        #check we found something
        if len(albums) < 1:
                print "ERROR: No albums found!"
                exit(1)

        return albums.items()

#################
# Program Start #
#################

usage = "Usage: %prog"
parser = OptionParser(usage=usage)
(options, args) = parser.parse_args()

#print the time for log purposes
print strftime("%Y-%m-%d %H:%M")

#we need somewhere to store played files so we don't repeat them all the time
save="/var/lib/addmusic"

########################
# Remove played tracks #
########################

#if mpc is stopped clear the playlist
if client.status()['state'] == 'stop':
    client.clear()
else:
    #remove played tracks
    for i in range(0, int(client.currentsong()['pos'])):
        client.delete(0)

##################################
# Add a new album if it's needed #
##################################

#we want at least 1 track in the playlist
if len(client.playlist()) <= 1:
        #add an album at random
        #this relies on a folder structure of "(artist)/(album)/.*(.mp3|.flac|etc)"
        print "1 track remains. Adding a random album..."
        
        #fetch a random album. Check there is actually tracks in it
        albums = getalbums()
        album = albums[randint(0, len(albums)-1)]
        print "adding: %s" % album[1]
        client.add(album[1]);

#if mpc is stopped start it playing
if client.status()['state'] == 'stop':
    client.play()

