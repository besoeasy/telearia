# Use the official Node.js 20 image as a base for ARM64
FROM node:slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json, then install dependencies
COPY package*.json ./

RUN npm install

# Install aria2 and clean up
RUN apt-get update && \
    apt-get install -y aria2 && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code and the startup script
COPY . .

# Expose the required ports for aria2c and the application
EXPOSE 6799 6800 6881-6888

# Set environment variables (you can override these at runtime)
ENV TELEGRAMBOT=Telegram-Bot-Token

CMD ["./start.sh"]