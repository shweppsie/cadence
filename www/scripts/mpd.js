/* MPD javascript functions
 * 
 * Trevor Fountain, Nathan Overall
 * 1 June 2007 - current
 */

var refreshDelay = 2000;

var curDirectory = new Array();
var volume;
var lastVolume;
var urlpath;
var playlistSize;
var prevSong;

function init() {
    Ajax.Responders.register({
        onCreate: function() {
            $('updating').style.display='';
        },
        onComplete: function() {
            $('updating').style.display='none';
        }
    });

    //Create volume slider
    volume = new Control.Slider('volume_handle','volume', {axis:'horizontal', minimum: 0, maximum: 100,alignX: 0, alignY: 0, onChange: setVolume});

    //variables for various things
    playlistSize = -1;
    prevSong = 0;

    //call the methods to put content into the page
    update();
    update_dir();
}

//method called to update content
function update() {
    refresh();
    setTimeout('update()',refreshDelay);
}

//called to update content on the page
function refresh() {
    new Ajax.Request("rpc/status.php",{
        method:"post",
        onSuccess: function(xml) {
            var res = xml.responseText.evalJSON();

            document.title = cleanup(res.artist) + " - " + cleanup(res.title);
            
            //updates the now playing stuff
            if(res.title && res.artist && res.album){
                $('nowplaying').innerHTML = "<span class=\"songinfo\">Title: </span>" + cleanup(res.title) + "<br>";
                $('nowplaying').innerHTML += "<span class=\"songinfo\">Artist: </span>" + cleanup(res.artist) + "<br>";
                $('nowplaying').innerHTML += "<span class=\"songinfo\">Album: </span>" + cleanup(res.album) + "<br>";
            } else if(res.file) {
                $('nowplaying').innerHTML = "<span class=\"songinfo\">" + cleanup(res.file) + "</span>";
            } else {
                $('nowplaying').innerHTML = "&nbsp;";
            }
            
            if(res.state == "paused") {
                $('pause').innerHTML = "Play";
            } else if(res.state == "play") {
                $('pause').innerHTML = "Pause";
            }

            volume.setValue(res.volume / 100.0);

            if(res.playlistlength != playlistSize) {
                songlist();
                playlistSize = res.playlistlength;
            }

            $('song_'+prevSong).style.fontWeight="";
            $('song_'+res.pos).style.fontWeight="bold";
            prevSong = res.pos;
        },
onFailure: function() {
           }
    });
}

function cleanup(text){
    text = text.replace("\\'","'");
    text = text.replace("\'","'");
    return text;
}

//builds playlist
function songlist() {
    new Ajax.Request("rpc/playlist.php",
        {
            method:"post",
            onSuccess: function(xml) {
                var res = xml.responseText.evalJSON();
                $('songlist').innerHTML = "";
                var cur = "";
                if(res.playlist[0].title != undefined) {
                    var artist = "";
                    var album = "";
                    for(var i = 0;i < res.playlist.length; i++) {
                        res.playlist[i].title = res.playlist[i].title.replace("\\'","'");
                        /*if(res.playlist[i].artist != artist && res.playlist[i].album == album)
                                $('songlist').innerHTML += "<span style=\"font-weight: bold;\"></span>this song by <span style=\"font-weight: bold;\">" + cleanup(res.playlist[i].artist) + "</span>";
                        else*/ if(res.playlist[i].artist != artist && res.playlist[i].album != album)
                                $('songlist').innerHTML += "<span style=\"font-weight: bold;\">" + cleanup(res.playlist[i].album) + "</span> by <span style=\"font-weight: bold;\">" + cleanup(res.playlist[i].artist) + "</span>";
                        $('songlist').innerHTML += "<li><a href='#' onclick='command(\"del\","+(i)+"); return false;'>[x]</a><a id='song_"+i+"' href='#' onclick='command(\"play\","+(i)+"); return false'>" + cleanup(res.playlist[i].title) + "</a></li>";
                        artist = res.playlist[i].artist;
                        album = res.playlist[i].album;
                    }
                }
                
            }
        });
}

function toggle_p(prop) {
    new Ajax.Request("rpc/toggle.php?property="+prop,
        {
            method:"post",
            onSuccess: function(xml) {
                refresh();
            }
        });
}

function update_dir(){
    var path = "";
    if(curDirectory.length > 0){
        for( var i = 0; i < curDirectory.length; i++){
            path += curDirectory[i];
            path += "/";
        }
        path = path.substring(0, path.length - 1);
    }

    if(path != ""){
        $('updir').innerHTML = "<li style=\"margin-bottom: 0.4em;\"><a onclick=\"up_directory(); return false;\" href=\"#\"><img style=\"padding-right: 4px;\" alt=\"[up]\" title=\"Up One Level\" src=\"images/previous.png\" /></a><a onclick=\"up_directory(); return false;\" href=\"#\">Up One Level</a></li>";
    } else {
        $('updir').innerHTML = "";
    }

    new Ajax.Request("rpc/directory.php?path="+path,
        {
            method:"post",
            onSuccess: function(xml) {
                data = xml.responseText.replace(/;amp_r;/g,"&amp;");
                $('directorylist').innerHTML = data;
            }
        })
}

function up_directory() {
    if(curDirectory.length > 0) {
        curDirectory.pop();
        update_dir();
    }
}

function down_directory(folder) {
    curDirectory.push(folder);
    update_dir();
}

function change_directory(path) {
    var newpath = path.split("/");
    curDirectory = new Array();
    for(i in newpath){
        curDirectory.push(i);
    }
    update_dir();
}

function addToPlaylist(path) {
    command('add',path);
}

function play() {
    cmd = $('pause').innerHTML.toLowerCase();
    
    if(cmd == "pause") {
        $('pause').innerHTML = "Play";
        command('pause=',true);
    } else {
        $('pause').innerHTML = "Pause";
        command('play');
    }
}

function command(cmd,args) {
    new Ajax.Request("rpc/command.php?command="+cmd+"&args="+args,
        {
            method:"post",
            onSuccess: function(xml) {
                refresh();
            }
        });
}

function setVolume(v) {
    v = (v*100).toFixed();
    if(v != lastVolume) {
        command("volume=",v);
        lastVolume = v;
    }
}
