<?php

require_once("../lib/mpd.php");
require_once("../config.php");

$mpd = new MPD(SERVER,PORT);

$commands = Array();
$commands['volume='] = "setVolume";
$commands['pause='] = "setPause";

$mpd->connect();

$command = $commands[$_GET['command']];
if(!isset($commands[$_GET['command']]))
  $command = $_GET['command'];

$result = 0;
if($_GET['args'] != "undefined") {
  $_GET['args'] = str_replace(";amp;","&",$_GET['args']);
  $result = $mpd->$command($_GET['args']);
}
else
  $result = $mpd->$command();

print_r($result);

$mpd->disconnect();

?>
