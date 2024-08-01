# Use the official Node.js 20 image as a base for ARM64
FROM node:slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Install aria2 and clean up
RUN apt-get update && \
    apt-get install -y aria2 && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code to the working directory
COPY . .

# Expose the required ports for aria2c and the application
EXPOSE 6600 6800 6881-6888

# Set environment variables (you can override these at runtime)
ENV TELEGRAMBOT=Telegram-Bot-Token

# Start aria2c and the Node.js application
CMD aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6800 --enable-dht --dht-listen-port=6881-6888 --seed-time=2000 & \
    node index.js
