#!/bin/bash


# Ensure SAVE_DIR exists
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/telearia')")

mkdir -p "$SAVE_DIR"

echo "Download directory: $SAVE_DIR"


# Start Nginx
nginx -g 'daemon off;' &

# Start the bot (no static server)
node app.js &

# Start aria2c with the specified options

aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6398 \
  --enable-dht \
  --bt-enable-lpd \
  --enable-peer-exchange \
  --dht-listen-port=6881-6999 \
  --bt-tracker=udp://tracker.opentrackr.org:1337/announce,http://tracker.torrent.eu.org:451/announce,udp://open.demonii.com:1337/announce,udp://tracker.coppersurfer.tk:6969/announce,udp://tracker.leechers-paradise.org:6969/announce,udp://exodus.desync.com:6969/announce,udp://tracker.zer0day.to:1337/announce,udp://tracker.pirateparty.gr:6969/announce,udp://tracker.internetwarriors.net:1337/announce,udp://tracker.openbittorrent.com:6969/announce,http://tracker.openbittorrent.com:80/announce,udp://tracker.tiny-vps.com:6969/announce,udp://open.stealth.si:80/announce,udp://tracker.dler.org:6969/announce,udp://tracker.bitsearch.to:1337/announce,http://nyaa.tracker.wf:7777/announce,udp://public.popcorn-tracker.org:6969/announce,udp://p4p.arenabg.com:1337/announce,udp://zephir.monocul.us:6969/announce,udp://tracker.swateam.org.uk:2710/announce,udp://tracker.iamhansen.xyz:2000/announce,udp://tracker.birkenwald.de:6969/announce \
