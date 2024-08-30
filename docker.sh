#!/bin/sh

# Start aria2c in the background
aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6800 --enable-dht --dht-listen-port=6881-6888 --max-concurrent-downloads=12 --seed-time=30 --bt-tracker="udp://tracker.openbittorrent.com:80,udp://tracker.opentrackr.org:1337,udp://tracker.internetwarriors.net:1337,udp://tracker.leechers-paradise.org:6969,udp://tracker.coppersurfer.tk:6969,udp://tracker.pirateparty.gr:6969,udp://tracker.cyberia.is:6969,udp://tracker.torrent.eu.org:451,udp://open.stealth.si:80,udp://explodie.org:6969,udp://tracker.opentrackr.org:1337/announce,udp://open.tracker.cl:1337/announce,udp://open.demonii.com:1337/announce,udp://open.stealth.si:80/announce,udp://tracker.torrent.eu.org:451/announce,udp://exodus.desync.com:6969/announce,udp://tracker-udp.gbitt.info:80/announce,udp://explodie.org:6969/announce,https://tracker.tamersunion.org:443/announce,http://tracker1.bt.moack.co.kr:80/announce,udp://tracker1.myporn.club:9337/announce,udp://tracker.tiny-vps.com:6969/announce,udp://tracker.bittor.pw:1337/announce,udp://tracker.0x7c0.com:6969/announce,udp://opentracker.io:6969/announce,udp://new-line.net:6969/announce,udp://leet-tracker.moe:1337/announce,udp://isk.richardsw.club:6969/announce,udp://bt.ktrackers.com:6666/announce,http://tr.kxmp.cf:80/announce" &

# Start the Node.js application
exec node index.js
