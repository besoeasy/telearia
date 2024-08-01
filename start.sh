#!/bin/sh

# Start aria2c in the background
aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6800 --enable-dht --dht-listen-port=6881-6888 --seed-time=2000 &

# Start the Node.js application
exec node index.js
