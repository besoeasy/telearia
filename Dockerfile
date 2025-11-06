FROM node:lts

RUN apt-get update &&  apt-get install -y aria2 samba wget

WORKDIR /app

COPY package.json package-lock.json* ./
RUN  npm install --production

COPY . .

EXPOSE 4445 6799 6888/tcp 6888/udp

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:6799/health || exit 1

CMD ["bash", "start.sh"]
