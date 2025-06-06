# Telegram-Controlled Cloud Downloader

TeleAria combines [Aria2](https://aria2.github.io/) with [Telegram](https://telegram.org/) for effortless downloading of files, torrents, and videos. Lightweight and customizable. Download remotely and watch on your laptop, mobile, smart tv - supports SMB share.

![TeleAria](https://github.com/user-attachments/assets/8f1165c5-f880-4efb-96aa-af9cfb8a4a49)

## Features

- Download files, torrents, and videos via Telegram
- High-speed downloads with Aria2
- Real-time progress updates
- Auto-sorted downloads
- Bandwidth and scheduling controls

## Quick Setup (Docker)

```bash
docker run -d \
  --name telearia \
  --restart unless-stopped \
  -p 6799:6799 \
  -e TELEGRAMBOT=Your-Telegram-Bot-Token \
  ghcr.io/besoeasy/telearia:main
```

- Restrict access: `-e WHITE_LIST_USER=123456,654321`
- Mount downloads: `-v /tmp/telearia:/tmp/telearia`
- Access downloads via HTTP: `http://<host>:6799/`


## Recommended Setup

```bash

mkdir -p $HOME/downloads
chmod -R 775 $HOME/downloads

docker run -d --name samba-docklite \
  -e GUEST=true \
  -e NAME="TeleAria" \
  -p 445:445 \
  -v $HOME/downloads:/storage \
  --restart unless-stopped \
  dockurr/samba


docker run -d \
  --name telearia \
  --restart unless-stopped \
  -p 6799:6799 \
  -v $HOME/downloads:/tmp/telearia \
  -e TELEGRAMBOT=Your-Telegram-Bot-Token \
  ghcr.io/besoeasy/telearia:main
```



## Tunnel (Optional)

Enhance self-hosting with [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) or Serveo:

```bash
ssh -R 80:localhost:6799 serveo.net
```
