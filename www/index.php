<?php require("config.php"); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <title>cadence</title>
        <link rel="stylesheet" type="text/css" media="screen" href="styles/<?php echo STYLE;?>.css" />
        <script src="scripts/prototype.js" type="text/javascript"></script>
        <script src="scripts/scriptaculous.js" type="text/javascript"></script>
        <script src="scripts/mpd.js" type="text/javascript"></script>
    </head>
    <body onload="init();">
            <div id="player">
                <div class="right_controls">
                    <img src="images/time.png" alt="Updating..." style='display:none' id='updating'/>
                </div>
                <span class="title1">cadence</span>
                <div class="playerbox">
                    <div class="controls">
                        <a class="control" href="#" onclick="command('previous'); return false">&lt;&lt; Prev</a>
                        |
                        <a class="control" href="#" onclick="play(); return false" id="pause"></a>
                        |
                        <a class="control" href="#" onclick="command('next'); return false">Next &gt;&gt;</a>
                    </div>
                    <div class="options">
                        <div style="color: white;">volume</div>
                        <div id="volume" style="width: 45%; background-color: #333; height: 5px;margin: 5px auto;">
                            <div id="volume_handle" style="width: 8px;height: 10px;background: #e91; cursor:move; position: relative; top: -2px;">
                            </div>
                        </div>
                    </div>
                    <div class="status">
                        <h3>Now Playing:</h3>
                        <div id="nowplaying" class="nowplaying">&nbsp;
                        </div>
                    </div>
                </div>
            </div>
    
        <div class="meta">
            <div id="playlist">
                <div class="right_controls">
                    <a href="#" onclick="command('clear'); songlist(); return false"><img src="images/playlist_clear.png" alt="Clear Playlist" title="Clear Playlist" /></a> 
                </div>
                <div class="header"><span class="title1">Current Playlist</span></div>
                <div class="scroller">
                    <ol id="songlist">
                        <li style="display: none"></li>
                    </ol>
                </div>
            </div>
            <div id="browser">
                <span class="title1">Directory Browser</span>
                <div id="dirnav">
                    <ul id="updir"></ul>
                    <div class="scroller">
                        <ul id="directorylist">
                            <li></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>
