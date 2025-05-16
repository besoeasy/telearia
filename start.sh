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

echo "Starting TeleAria bot..."
node app.js &

sleep 7

echo "Serving downloads directory at http://localhost:6799/"
npx serve "$SAVE_DIR" -l 6799