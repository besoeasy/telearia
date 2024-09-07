#!/bin/sh

# Start aria2c in the background
aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6800 --enable-dht --dht-listen-port=6881-6888 --max-concurrent-downloads=12 --seed-time=30 --bt-tracker="udp://tracker.opentrackr.org:1337,udp://opentracker.io:80/announce,udp://opentracker.io:6969/announce,udp://tracker.openbittorrent.com:80,udp://explodie.org:6969,udp://tracker.coppersurfer.tk:6969" &

# Start the Node.js application
exec node index.js
