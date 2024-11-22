#!/bin/sh
aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6798 --enable-dht --dht-listen-port=6881-6888 --seed-time=9 --bt-tracker='udp://tracker.opentrackr.org:1337,udp://opentracker.io:80/announce,udp://opentracker.io:6969/announce,udp://tracker.openbittorrent.com:80,udp://explodie.org:6969' &
exec node index.js
