<?php

$options = [
    CURLOPT_RETURNTRANSFER => true,
];

include "prerender_token.php";

$ch = curl_init("https://ssr.inventivetalent.org/render?token=".PRERENDER_TOKEN."&url=".urlencode("https://mineskin.org".$_SERVER["REQUEST_URI"]) );
curl_setopt_array($ch, $options);
$remoteSite = curl_exec($ch);
$header = curl_getinfo($ch);
curl_close($ch);

echo $remoteSite;
