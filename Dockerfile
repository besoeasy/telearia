# Use the official Node.js 20 slim image as a base for ARM64
FROM node:slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./
RUN npm install

# Install aria2, nginx, and clean up
RUN apt-get update && \
    apt-get install -y aria2 nginx && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code and the startup script
COPY . .

# Copy the NGINX configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose the required ports for aria2c and the application
EXPOSE 6799 6881-6888

# Set PURGEINTERVAL to 7
ENV PURGEINTERVAL=7

# Set Tunnel 
ENV TUNNELURL=http://pi.local:6799

# Set environment variables (you can override these at runtime)
ENV TELEGRAMBOT=Telegram-Bot-Token

# Start NGINX and the application
CMD ["sh", "-c", "nginx && ./docker.sh"]