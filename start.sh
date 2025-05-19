#!/bin/bash

aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6398 \
  --enable-dht \
  --bt-enable-lpd \
  --enable-peer-exchange \
  --dht-listen-port=50000-50008 \
  --listen-port=50010-50020 \
  --bt-tracker='udp://tracker.opentrackr.org:1337/announce,udp://opentracker.io:80/announce,udp://tracker.torrent.eu.org:451/announce,udp://tracker.internetwarriors.net:1337/announce,udp://tracker.leechers-paradise.org:6969/announce,udp://tracker.coppersurfer.tk:6969/announce,udp://tracker.cyberia.is:6969/announce,udp://exodus.desync.com:6969/announce,udp://explodie.org:6969/announce,udp://open.stealth.si:80/announce,udp://tracker.moeking.me:6969/announce,udp://tracker.openbittorrent.com:80/announce' \
  --seed-time=100 &

sleep 2

# Ensure SAVE_DIR exists
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/telearia')")

mkdir -p "$SAVE_DIR"

echo "Download directory: $SAVE_DIR"

sleep 2

# Start Nginx
nginx -g 'daemon off;' &

sleep 2

# Start the bot (no static server)
node app.js 