#!/bin/bash

aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6798 \
  --enable-dht \
  --bt-enable-lpd \
  --enable-peer-exchange \
  --seed-time=100 &

# Ensure SAVE_DIR exists
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/downloads')")
mkdir -p "$SAVE_DIR"

echo "Starting TeleAria bot..."
node app.js &

# Wait a bit to ensure bot is up (optional, adjust as needed)
sleep 2

echo "Serving downloads directory at http://localhost:6799/"
npx serve "$SAVE_DIR" -l 6799

# --- Minimal Samba setup ---
# Create a minimal smb.conf for $SAVE_DIR
cat >/etc/samba/smb.conf <<EOL
[global]
   workgroup = WORKGROUP
   server string = TeleAria Samba
   map to guest = Bad User
   log file = /var/log/samba/log.%m
   max log size = 50
   security = user
guest account = nobody

[downloads]
   path = $SAVE_DIR
   browsable = yes
   writable = yes
   guest ok = yes
   read only = no
   force user = nobody
EOL

# Ensure permissions for guest access
chown -R nobody:nogroup "$SAVE_DIR"
chmod -R 0777 "$SAVE_DIR"

# Start Samba service
smbd -F &
