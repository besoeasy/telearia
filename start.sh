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

# --- Minimal FTP setup ---
# Install pyftpdlib if not already installed
if ! command -v python3 &>/dev/null || ! python3 -m pip show pyftpdlib &>/dev/null; then
  echo "Installing pyftpdlib for FTP server..."
  python3 -m pip install --user pyftpdlib
fi

# Start anonymous FTP server for $SAVE_DIR
# Accessible at ftp://<server-ip>:6800/ with no login required
python3 -m pyftpdlib -p 6800 -w -d "$SAVE_DIR" &
