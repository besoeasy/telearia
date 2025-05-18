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
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/telearia')")

mkdir -p "$SAVE_DIR"

echo "Download directory: $SAVE_DIR"

# Start Nginx
nginx -g 'daemon off;' &

# Start the bot (no static server)
node app.js