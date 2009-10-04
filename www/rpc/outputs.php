<?php

require_once("../lib/mpd.php");
require_once("../config.php");

$mpd = new MPD(SERVER,PORT);

$mpd->connect();

if(isset($_GET['enable'])) {
  $id = intval($_GET['enable']);
} else if(isset($_GET['disable'])) {
  $id = intval($_GET['disable']);
} else {
  echo json_encode($mpd->outputs());
}
$mpd->disconnect();

?>
