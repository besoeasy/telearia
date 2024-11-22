# Use the official Node.js 20 slim image as a base for ARM64
FROM node:slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./

RUN npm install

# Install aria2, and clean up
RUN apt-get update && apt-get install -y aria2 && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code
COPY . .

# Expose necessary ports
EXPOSE 6798

# Set environment variables
ENV TELEGRAMBOT="Telegram-Bot-Token"

# Add and set permissions for startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Start the application
CMD ["sh", "/app/start.sh"]
