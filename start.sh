#!/bin/sh
aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6798 \
  --enable-dht \
  --dht-listen-port=50000-50008 \
  --listen-port=50010-50020 \
  --seed-time=0 \
  --bt-tracker='udp://tracker.opentrackr.org:1337/announce,udp://opentracker.io:80/announce,udp://tracker.torrent.eu.org:451/announce,udp://tracker.internetwarriors.net:1337/announce,udp://tracker.leechers-paradise.org:6969/announce,udp://tracker.coppersurfer.tk:6969/announce,udp://tracker.cyberia.is:6969/announce,udp://exodus.desync.com:6969/announce,udp://explodie.org:6969/announce,udp://open.stealth.si:80/announce,udp://tracker.moeking.me:6969/announce,udp://tracker.openbittorrent.com:80/announce' \
  --max-connection-per-server=16 \
  --split=16 \
  --min-split-size=4M \
  --max-concurrent-downloads=5 \
  --bt-enable-lpd \
  --enable-peer-exchange \
  --bt-force-encryption \
  --seed-ratio=0.1 \
  --optimize-concurrent-downloads=true &
exec node index.js
