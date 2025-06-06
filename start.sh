#!/bin/bash

# Ensure SAVE_DIR exists
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/telearia')")

mkdir -p "$SAVE_DIR"

echo "Download directory: $SAVE_DIR"

sleep 2

# Install Samba if not already installed
if ! command -v smbd &> /dev/null; then
  apt-get update && apt-get install -y samba
fi

# Create minimal smb.conf for guest access
cat >/etc/samba/smb.conf <<EOL
[global]
   map to guest = Bad User
   guest account = nobody
   server min protocol = SMB2
   disable netbios = yes
   smb ports = 445

[telearia]
   path = $SAVE_DIR
   read only = yes
   guest ok = yes
   force user = nobody
   browseable = yes
EOL

# Ensure permissions for guest access
chown -R nobody:nogroup "$SAVE_DIR"
chmod -R 0775 "$SAVE_DIR"

# Start Samba (SMB) server
smbd --foreground --no-process-group &

sleep 2

# Start Aria2c
aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6398 \
  --bt-tracker='udp://tracker.opentrackr.org:1337/announce,udp://opentracker.io:80/announce,udp://tracker.torrent.eu.org:451/announce,udp://tracker.internetwarriors.net:1337/announce,udp://tracker.leechers-paradise.org:6969/announce,udp://tracker.coppersurfer.tk:6969/announce,udp://tracker.cyberia.is:6969/announce,udp://exodus.desync.com:6969/announce,udp://explodie.org:6969/announce,udp://open.stealth.si:80/announce,udp://tracker.moeking.me:6969/announce,udp://tracker.openbittorrent.com:80/announce' \
  --seed-time=100 &

sleep 2

# Start Nginx
nginx -g 'daemon off;' &

sleep 2

# Start the bot (no static server)
node app.js