<?php

require_once("../lib/mpd.php");
require_once("../config.php");

// Unit test
header("Content-type: text/plain");
$mpd = new MPD(SERVER,PORT);
$mpd->connect();

$status['playlist'] = $mpd->getCurrentPlaylist();
$mpd->disconnect();

echo json_encode($status);
?>
