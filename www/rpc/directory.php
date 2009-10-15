<?php

require_once('../lib/mpd.php');
require_once('../config.php');

$mpd = new MPD(SERVER,PORT);

$mpd->connect();
$path = str_replace(";amp;","&",$_GET['path']);
$list = $mpd->ls($path);
$mpd->disconnect();

foreach($list as $line) {
  $keyval = explode(": ",$line);
  $keyval[1] = addslashes(stripslashes($keyval[1]));
  $keyval[1] = preg_split("/[^\]]\//",$keyval[1]);
  $keyval[1] = $keyval[1][count($keyval[1]) - 1]; 
  $pretty_val = str_replace(" & "," ;amp_r; ",$keyval[1]);
  $keyval[1] = str_replace(" & "," ;amp; ",$keyval[1]);
  $pretty = stripslashes($pretty_val);
  if($keyval[0] == "file") {
    echo "<li><a onclick=\"addToPlaylist('$path/{$keyval[1]}'); return false;\" href=\"#\">";
    echo "<img style=\"padding-right: 4px;\" alt=\"[add]\" title=\"Add to Playlist\" src=\"images/file_add.png\" /></a>";
    echo "<a onclick=\"addToPlaylist('$path/{$keyval[1]}'); return false;\" href=\"#\">{$pretty}</a></li>";
  } elseif ($keyval[0] == "directory") {
    echo "<li><a onclick=\"addToPlaylist('$path/{$keyval[1]}'); return false;\" href=\"#\">";
    echo "<img style=\"padding-right: 4px;\" alt=\"[add]\" title=\"Add to Playlist\" src=\"images/folder_add.png\" /></a>";
    echo "<a onclick=\"replaceCurrentPlaylist('$path/{$keyval[1]}'); return false;\" href=\"#\">";
    echo "<img style=\"padding-right: 4px;\" alt=\"[add]\" title=\"Replace Current Playlist\" src=\"images/replace.png\" /></a>";
    echo "<a onclick=\"down_directory('{$keyval[1]}'); return false;\" href=\"#\">{$pretty}</a></li>";
  }
}

?>
