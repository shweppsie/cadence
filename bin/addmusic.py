#!/usr/bin/env python

from sys import stderr
from subprocess import Popen, PIPE
from re import findall, match, search
from random import randint
from time import strftime, sleep
from optparse import OptionParser

#find albums in mpd library
#this assumes a folder structure of "albums/(artist)/(album)/.*(.mp3|.flac|etc)"
def getalbums():
	(output, error) = Popen([mpc, "listall"], stdout=PIPE, stderr=PIPE, env=environment).communicate()
	if error.strip() != "":
		stderr.write("ERROR: "+error)
		exit(1)
	
	#find albums and add them to the set
	keys = {}
	for i in findall('albums/.*/(.*)/.*\.(mp3|flac)', output):
		keys[i[0]] = 1
	#check we found something
	if len(keys) < 1:
		stderr.write("ERROR: No albums found!")
		exit(1)
	return keys.keys()

def gettracks(album):
	(output, error) = Popen([mpc, "listall"], stdout=PIPE, env=environment).communicate()
	if error != None:
		stderr.write("ERROR: "+error)
		exit(1)
	#add tracks from the album to the list
	tracks = []
	for i in findall('(albums/.*/'+album+'/.*\.(mp3|flac))', output):
		tracks.append(i[0])
	return tracks

#################
# Program Start #
#################

usage = "Usage: %prog"
parser = OptionParser(usage=usage)
(options, args) = parser.parse_args()

#print the time for log purposes
print strftime("%Y-%m-%d %H:%M")

#we use mpc for mpd playlist manipulation
mpc="/usr/bin/mpc"

#some environment variables needed for mpc
environment=dict(MPD_HOST='127.0.0.1')

########################
# Remove played tracks #
########################

#get the playlist from mpd
(output, error) = Popen([mpc, "--format", "\"%file%\"", "playlist"], stdout=PIPE, stderr=PIPE, env=environment).communicate()
if error.strip() != "":
	stderr.write("ERROR: "+error)
	exit(1)

#get number of tracks in playlist
Tracks = output.split("\n")

if len(Tracks) > 2:
	#get the currently playing track number
	curTrack = int(findall('>([0-9]*)', output)[0])
	
	#remove already played tracks
	for i in range(curTrack-1):
		try:
			print "Removing played Track: "+findall(' [0-9]\)(.*)', Tracks[i])[0]
		except:
			print "Removed Unknown Track"
		Popen(["mpc", "del", "1"], env=environment).communicate()

##################################
# Add a new album if it's needed #
##################################

#get the playlist again (remeber mpd is still playing so data may change)
(output, error) = Popen([mpc, "playlist"], stdout=PIPE, stderr=PIPE, env=environment).communicate()
if error.strip() != "":
	stderr.write("ERROR: "+error)
	exit(1)

#get the number of tracks
noTracks = output.count("\n")

#we want at least 3 tracks in the playlist
if noTracks < 4:
	#add an album at random
	#this relies on a folder structure of "(artist)/(album)/.*(.mp3|.flac|etc)"
	print "Less than 4 tracks remain. Adding a random album..."
	tracks = []

	#fetch a random album. Check there is actually tracks in it
	while len(tracks) < 1:
		albums = getalbums()
		album = albums[randint(0, len(albums)-1)]
		tracks = gettracks(album)

	for i in tracks:
		(output, error) = Popen(["mpc", "add", i], stdout=PIPE, stderr=PIPE, env=environment).communicate()
		if error.strip() != "":
			stderr.write("ERROR: "+error)
			exit(1)
		if output != "":
			if match('adding: .*', output):
				print "Adding: "+i
			else:
				stderr.write("ERROR: "+output)
				exit(1)

	#make mpc start playing if it is not
	(output, error) = Popen([mpc, "play"], stdout=PIPE, stderr=PIPE, env=environment).communicate()
	if error.strip() != "":
		stderr.write("ERROR: "+error)
		stderr.write("ERROR: "+output)
		exit(1)
