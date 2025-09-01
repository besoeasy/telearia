FROM node:lts-slim

# Install only needed tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      aria2 samba \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 445 6799 6888/tcp 6888/udp

CMD ["bash", "start.sh"]
