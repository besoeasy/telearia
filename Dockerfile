FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y aria2 python3 python3-pip \
    && pip3 install pyftpdlib 

COPY . .

EXPOSE 6799
EXPOSE 6800

ENV TELEGRAMBOT="Telegram-Bot-Token"

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["sh", "/app/start.sh"]
