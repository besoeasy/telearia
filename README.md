# TeleAria  
**Telegram-Controlled Cloud Downloader**

TeleAria combines [Aria2](https://aria2.github.io/) with [Telegram](https://telegram.org/) for effortless downloading of files, torrents, and videos. Lightweight and customizable, it integrates seamlessly with [Plex](https://www.plex.tv/), [Jellyfin](https://jellyfin.org/), or [Stremio](https://www.strem.io/) to enhance your media setup.

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
- Mount downloads: `-v /path/to/downloads:/tmp/downloads`

## Media Integration
- **Plex/Jellyfin**: Set `/tmp/downloads` as your media folder  
  ![Integration](https://github.com/user-attachments/assets/3c8dc81f-7333-4465-9720-bdb7c6ae4bfc)
- **Stremio**: Use `http://localhost:6799/manifest.json`  
  ![Stremio](https://github.com/user-attachments/assets/bc5c7c05-4823-4643-9e5e-e51b711d416e)

## Tunnel (Optional)
Enhance self-hosting with [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) or Serveo:
```bash
ssh -R 80:localhost:6799 serveo.net
```
