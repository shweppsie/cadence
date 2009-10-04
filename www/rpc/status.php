<?php

require_once("../lib/mpd.php");
require_once("../config.php");

// Unit test
header("Content-type: text/plain");
$mpd = new MPD(SERVER,PORT);
$mpd->connect();

$status = $mpd->getCurrentSong();
if(empty($status)) {
  $status = Array();
}
$status = array_merge($status,$mpd->getStatus());
$status['repeat'] = ($status['repeat'] == 1 ? true : false);
$status['random'] = ($status['random'] == 1 ? true : false);
$mpd->disconnect();

echo json_encode($status);
?>
