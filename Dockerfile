FROM node:lts

# Install aria2 and nginx
RUN apt-get update && \
    apt-get install -y aria2 nginx samba

# Set workdir
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --production

# Copy app source
COPY . .

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/telearia.conf

# Expose port  
EXPOSE 6799 445 51413 51413/udp

# Start script
CMD ["bash", "start.sh"]
