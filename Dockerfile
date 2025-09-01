FROM node:lts-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      aria2 samba python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN  npm install --production

COPY . .

EXPOSE 445 6799 6888/tcp 6888/udp

CMD ["bash", "start.sh"]
