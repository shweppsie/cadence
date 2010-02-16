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

var path

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
           
            //updates the now playing stuff
            if(res.title && res.artist && res.album){
                $('nowplaying').innerHTML = "<span class=\"songinfo\">Title: </span>" + cleanup(res.title) + "<br>";
                $('nowplaying').innerHTML += "<span class=\"songinfo\">Artist: </span>" + cleanup(res.artist) + "<br>";
                $('nowplaying').innerHTML += "<span class=\"songinfo\">Album: </span>" + cleanup(res.album) + "<br>";
                document.title = cleanup(res.artist) + " - " + cleanup(res.title);
            } else if(res.file) {
                $('nowplaying').innerHTML = "<span class=\"songinfo\">" + cleanup(res.file) + "</span>";
                document.title = cleanup(res.file);
            } else {
                $('nowplaying').innerHTML = "&nbsp;";
                document.title = "Not Playing";
            }

            if(res.state == "pause") {
                $('pause').innerHTML = "Play";
            } else {
                $('pause').innerHTML = "Pause";
            }

            volume.setValue(res.volume / 100.0);

            if(res.playlistlength != playlistSize) {
                songlist();
                playlistSize = res.playlistlength;
            }

            if($('song_'+res.pos) && $('song_'+res.pos).style.fontWeight != "bold"){
                $('song_'+res.pos).style.fontWeight = "bold";
                if(prevSong != null && $('song_'+prevSong) != null && prevSong != res.pos){
                    $('song_'+prevSong).style.fontWeight = "";
                    prevSong = res.pos;
                }
            }
        }
    });
}

function cleanup(text){
    text = text.replace(/\\'/g, "'");
    text = text.replace(/\'/g, "'");
    text = text.replace(/\\"/g, "\"");
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
                var album = "";
                var artist = "";
                var oldalbum = "";
                for(var i = 0;i < res.playlist.length; i++) {
                    if(res.playlist[i].artist == undefined){
                        artist = 'unknown artist';
                    } else {
                        artist = res.playlist[i].artist;
                    }
                    if(res.playlist[i].album == undefined){
                        album = 'unknown album';
                    } else {
                        album = res.playlist[i].album;
                    }
                    if(oldalbum != album){
                        $('songlist').innerHTML += "<div><span style=\"font-weight: bold;\">" + cleanup(album) + "</span> by <span style=\"font-weight: bold;\">" + cleanup(artist) + "</span></div>";
                        oldalbum = album;
                    }
                    if(res.playlist[i].title == undefined){
                        $('songlist').innerHTML += "<li><a href='#' onclick='command(\"del\","+(i)+"); return false;'>[x]</a><a id='song_"+i+"' href='#' onclick='command(\"play\","+(i)+"); return false'>Unknown Track</a></li>";
                    } else {
                        $('songlist').innerHTML += "<li><a href='#' onclick='command(\"del\","+(i)+"); return false;'>[x]</a><a id='song_"+i+"' href='#' onclick='command(\"play\","+(i)+"); return false'>" + cleanup(res.playlist[i].title) + "</a></li>";
                    }
                }
                refresh();
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
    path = "";
    
    if(curDirectory.length > 0){
        for( var i = 0; i < curDirectory.length; i++){
            path += curDirectory[i];
            path += "/";
        }
        path = path.substring(0, path.length - 1);
    }
    
    new Ajax.Request("rpc/directory.php?path="+path,
        {
            method:"post",
            onCreate: function() {
                var div =  document.createElement('div');
                var image = document.createElement('img');
                div.style.height = '100%';
                image.setAttribute('src', './images/preloader.gif');
                div.appendChild(image);
                $('dirnav').innerHTML = "";
                $('dirnav').appendChild(div);
            },
            onSuccess: function(xml) {
                var data = xml.responseText.replace(/;amp_r;/g,"&amp;");
                var scroller = document.createElement('div');
                var directorylist = document.createElement('div');
                
                scroller.className = "scroller";
                directorylist.id = "directorylist";
                scroller.appendChild(directorylist);
                
                $('dirnav').innerHTML = "";
                $('dirnav').appendChild(scroller);
                $('directorylist').innerHTML = data;

                if(path != ""){
                    up = document.createElement('a');
                    up.style.marginBottom = "0.4em";
                    up.setAttribute('href', '#');
                    up.setAttribute('onclick', 'up_directory(); return false;');
                    up.innerHTML = "Up One Level";
                    up.style.textDecoration = 'none';
                    up.style.color = '#662211';
                    $('dirnav').insertBefore(up, scroller);
                } else {
                    if($('updir')){
                        $('dirnav').removeChild($('updir'));
                    }
                }
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
    command('play');
}

function replaceCurrentPlaylist(path) {
    command('clear');
    command('add',path);
    command('play');
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
