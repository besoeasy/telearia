# Use the official Node.js 20 slim image as a base for ARM64
FROM node:slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./

RUN npm install

# Install aria2, and clean up
RUN apt-get update && apt-get install -y aria2 

# Copy the rest of the application code
COPY . .

# Expose Ports
EXPOSE 6799-6888

# Set environment variables (you can override these at runtime)
ENV TELEGRAMBOT=Telegram-Bot-Token

# Start aria2c, then the Node.js application
CMD sh -c "aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6800 --enable-dht --dht-listen-port=6881-6888 --seed-time=9 --bt-tracker='udp://tracker.opentrackr.org:1337,udp://opentracker.io:80/announce,udp://opentracker.io:6969/announce,udp://tracker.openbittorrent.com:80,udp://explodie.org:6969' & exec node index.js"
