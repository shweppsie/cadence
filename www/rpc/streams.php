<?php

require_once("../lib/mpd.php");
require_once("../config.php");

$mpd = new MPD(SERVER,PORT);

$mpd->connect();

if(isset($_GET['cmd'])) {
  if(isset($_GET['args']))
    $results = $mpd->$_GET['cmd']($_GET['args']);
  else
    $results = $mpd->$_GET['cmd']();
} else {
  $results = $mpd->send($_GET['msg']);
}
$mpd->disconnect();

echo json_encode($results);

?>
