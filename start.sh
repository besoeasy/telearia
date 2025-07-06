#!/bin/bash

# Ensure SAVE_DIR exists
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/telearia')")

mkdir -p "$SAVE_DIR"

echo "Download directory: $SAVE_DIR"

sleep 2

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
  --seed-time=100 \
  --listen-port=51413 \
  --dht-listen-port=51413 \
  --enable-dht=true \
  --enable-peer-exchange=true &

sleep 2

# Start Nginx
nginx -g 'daemon off;' &

sleep 2

# Start the bot (no static server)
node app.js