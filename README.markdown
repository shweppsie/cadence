# CADENCE #

cadence is intended to play constant music from an mpd music collection. There will be 2 components:

##Daemon##
A python daemon which monitors mpd and adds random tracks or whole albums before playback stops.

Current Progress:

  * So far there is a script which can be added to a cron job which calls mpc to add albums
  * Use python-mpd python library to talk to mpd

Planned Modifications/Features:

  * Make into a daemon
  * Be clever and work out albums by reoccurance of album tags (for people who suck at organising music. see [albumidentify](http://github.com/scottr/albumidentify/tree/master))
  * provide ratings somehow
  * be more clever about shuffle (don't repeat albums and avoid playing the same artist continuously)
  * collect statistics about played tracks and provide them with a command so we can use them with the web interface

##web front end##
This will interface with the daemon and mpd. Essentially it will be an mpd web front end customised to work with the features of cadence. (i.e. skip current album, don't play certain albums, etc...)

Current Progress:

  * forked orangePlayer (an mpd webfrontend)
  * started modifying it for cadence

Planned Modifications/Features:

  * Special features of the daemon (ratings, next album, selecting albums that will be automatically added, etc)
 
