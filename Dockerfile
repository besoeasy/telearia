FROM node:20-slim

# Install aria2 and nginx
RUN apt-get update && \
    apt-get install -y aria2 nginx && \
    rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --production

# Copy app source
COPY . .

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/telearia.conf

# Expose port for nginx
EXPOSE 6799
# Expose bittorrent port
EXPOSE 6881

# Start script
CMD ["bash", "start.sh"]
