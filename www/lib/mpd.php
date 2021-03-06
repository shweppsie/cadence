<?php

class MPD {
    var $server;
    var $port;
    var $socket;
    var $error = NULL;
    
    function MPD($server,$port) {
        $this->server = $server;
        $this->port = intval($port);
    }
    
    function connect() {
        $this->socket = fsockopen($this->server,$this->port,$errno,$this->error);
        return $this->readline();
    }
    
    function isConnected() {
        return ($this->socket == false ? false : true);
    }
    
    function disconnect() {
        if($this->isConnected())
            return fclose($this->socket);
        return false;
    }
    
    function readline() {
        if($this->isConnected()) {
            $line = addslashes(fgets($this->socket));
            return $line;
        }
        return false;
    }
    
    function send($string) {
        $string = stripslashes(trim($string));
        $string = "$string\n";
        if($this->isConnected()) {
            $retval = fputs($this->socket,$string);
            if($retval !== false) {
                $results = Array();
                $line = "";
                while(($line = $this->readline()) != "OK\n") {
                    if(strpos($line,"ACK") === 0) {
                        $this->error = $line;
                        return $this->error;
                    }
                    $results[] = trim($line);
                }
                $results[] = $line;
                if(count($results) == 1){
                    return $results[0];
                }
                else
                {
                    return $results;
                }
            }
        }
        return false;
    }
    
    function nested_hashify($array) {
        if($array == "OK\n")
            return Array();
        if(!is_array($array))
            $array = Array($array);
        $hash = Array();
        $subhash = Array();
        foreach($array as $line) {
            $keyval = explode(": ",$line,2);
            if(isset($subhash[$keyval[0]])) {
                $hash[] = $subhash;
                $subhash = Array();
            }
            if($keyval[0] != "OK\n") {
                $subhash[strtolower($keyval[0])] = $keyval[1];
            }
        }
        $hash[] = $subhash;
        return $hash;
    }
    
    function hashify($array) {
        if(!is_array($array))
            $array = Array($array);
        $hash = Array(); // God, I hate this language...
        foreach($array as $line) {
            $keyval = explode(": ",$line,2);
            $hash[strtolower($keyval[0])] = $keyval[1];
        }
        return $hash;
    }
    
    function getCurrentSong() {
        return $this->hashify($this->send("currentsong"));
    }
    
    function getStatus() {
        return $this->hashify($this->send("status"));
    } 
    
    function getCurrentPlaylist() {
        $playlist = $this->nested_hashify($this->send("playlistinfo"));
        
        foreach($playlist as $index => $song) {
            if(!isset($song['title']) and strpos($song['file'],"/") !== false)
                $playlist[$index]['title'] = substr($song['file'],strrpos($song['file'],"/")+1);;
            if(!isset($song['artist']))
                $playlist[$index]['artist'] = "Unknown";
            if(!isset($song['album']))
                $playlist[$index]['album'] = "Unknown";
        }
                
        return $playlist;
    }
    
    function setVolume($volume) {
        return $this->send("setvol $volume");
    }
    
    function enqueue($path) {
        $result = Array();
        $result[] = $this->add($path);
        $id = $this->getStatus();
        $id = intval($id['playlistlength']) - 1;
        $dest = $this->getCurrentSong();
        $dest = intval($id['pos']) + 2;
        $result[] = "move $id $dest";
        $result[] = $this->send("move $id $dest");
        return $result;
    }

    function load($playlist) {
        return $this->send("load \"$playlist\"");
    }
    
    function update() {
        return $this->send("update");
    }
    
    function clear() {
        return $this->send("clear");
    }
    
    function play($id="") {
        return $this->send("play $id");
    }
    
    function del($id="") {
        return $this->send("delete $id");
    }
    
    function stop() {
        return $this->send("stop");
    }
    
    function next() {
        return $this->send("next");
    }
    
    function previous() {
        return $this->send("previous");
    }

    function replace($path) {
        $cmd = "command_list_begin\nclear\nadd \"$path\"\nplay\ncommand_list_end";
        return $this->send($cmd);
    }
    
    function add($path) {
        return $this->send("add \"$path\"");
    }
    
    function save($playlist) {
        return $this->send("save \"$playlist\"");
    }
    
    function rm($playlist) {
        return $this->send("rm \"$playlist\"");
    }
    
    function setPause($bool) {
        if($bool == "true")
            $bool = 1;
        else
            $bool = 0;
        return $this->send("pause $bool");
    }
    
    function playlists() {
        $list = $this->send("lsinfo");
        array_walk($list,format_list,Array("playlist"));
        $list = array_filter($list,"isFalse");
        sort($list);
        return $list;
    }
    
    function ls($path="/") {
        $list = $this->send("lsinfo \"$path\"");
        array_walk($list,exclude,Array("directory","file"));
        $list = array_filter($list,"isFalse");
        sort($list);
        return $list;
    }
    
    function outputs() {
        $list = $this->send("outputs");
        return $this->nested_hashify($list);
    }
}

// Callbacks for array_* functions

function filter(&$pair,$type) {
    if($pair[0] == $type) {
        return $pair[1];
    } else {
        return false;
    }
}

function isFalse($line) {
    return ($line !== false && $line != null);
}

function exclude(&$line,$key,$allow) {
    $keyval = explode(": ",$line,2);
    if(!in_array($keyval[0],$allow)) {
        $line = false;
    }
}

function format_list(&$line,$key,$type) {
    $keyval = explode(": ",$line,2);
    if(in_array($keyval[0],$type)) {
        $line = $keyval[1];
    } else {
        $line = false;
    }
}

?>
