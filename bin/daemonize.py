#!/usr/bin/env python

import os
import sys

def daemonize():
    #fork twice
    try:
        pid = os.fork()
    except OSError, e:
        raise Exception, "%s [%d]" % (e.strerror, e.errno)
    if pid == 0:
        os.setsid()
        try:
            pid = os.fork()
        except OSError, e:
            raise Exception, "%s [%d]" % (e.strerror, e.errno)
        if pid != 0:
            #see comment below
            os._exit(0)
    else:
        #close the other process from the fork
        #use _exit so python doesn't close the
        #resources being used in the other process.
        os._exit(0)
    
    #get number of file descriptors 
    import resource
    maxfd = resource.getrlimit(resource.RLIMIT_NOFILE)[1]
    if (maxfd == resource.RLIM_INFINITY):
        maxfd = 1024

    #close all file descriptors.
    for fd in range(0, maxfd):
        try:
            os.close(fd)
        #fd wasn't open
        except OSError:
            pass

    #hook up stdout and stderr
    logger = open('/var/log/cadence.log', 'a')
    sys.stdout = logger
    sys.stderr = logger
    
    #set standard in to devnull
    os.open(os.devnull, os.O_RDWR)
    
    # Duplicate standard input to standard output and standard error.
    os.dup2(0, 1)            # standard output (1)
    os.dup2(0, 2)            # standard error (2)
   
