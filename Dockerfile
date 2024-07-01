# Use the official Node.js 20 image as a base for ARM64
FROM node:20-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm i

# Copy the rest of the application code to the working directory
COPY . .

# Install aria2 (if needed)
RUN apt-get update && apt-get install -y aria2

# Create the save directory for downloads and set the proper permissions
RUN mkdir -p /downloads && chmod -R 777 /downloads

# Expose the required ports for aria2c and the Telegram bot
EXPOSE 6800 6881-7999

# Set environment variables (you can override these at runtime)
ENV TELEGRAMBOT=your-telegram-bot-token

# Run the application
CMD ["node", "index.js"]
