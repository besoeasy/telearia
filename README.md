## TeleAria: Telegram-Controlled Cloud Downloader

TeleAria is a powerful cloud downloader that integrates [Aria2](https://aria2.github.io/) with [Telegram](https://telegram.org/). Download files, torrents, and videos effortlessly.

![TeleAria](https://github.com/user-attachments/assets/8f1165c5-f880-4efb-96aa-af9cfb8a4a49)

### Key Features

- **Versatile Downloading**: Supports files, torrents, and videos.
- **Telegram Control**: Manage downloads via Telegram commands.
- **Fast Performance**: Enjoy high-speed downloads with Aria2.
- **User-Friendly**: Simple setup and intuitive interface.
- **Real-Time Notifications**: Get instant updates on progress.
- **Organized Files**: Automatically sort downloads by type.
- **Scheduled Downloads**: Optimize bandwidth with scheduling.
- **Bandwidth Control**: Manage download/upload speeds.

### Quick Installation with Docker

Run TeleAria using Docker by replacing `Telegram-Bot-Token` with your actual token:

```bash
docker run -d \
  --name telearia \
  --restart unless-stopped \
  --network host \
  -e TELEGRAMBOT=Telegram-Bot-Token \
  ghcr.io/besoeasy/telearia:main
```

### Cloudflare Tunnel Setup

Pair TeleAria with a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) for enhanced self-hosting.
