#!/bin/sh
aria2c \
  --enable-rpc \
  --rpc-listen-all \
  --rpc-listen-port=6798 \
  --enable-dht \
  --bt-enable-lpd \
  --enable-peer-exchange \
  --seed-time=100 &
exec node app.js
