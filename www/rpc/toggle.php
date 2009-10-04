<?php

require_once("../lib/mpd.php");
require_once("../config.php");

$mpd = new MPD(SERVER,PORT);

$property = $_GET['property'];

$mpd->connect();
$status = $mpd->getStatus();
$bool = $status[$property];
$mpd->send($property . " " . ($bool == 0 ? 1 : 0));
$mpd->disconnect();
?>
