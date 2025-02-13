## TeleAria: Telegram Controlled Cloud Downloader Manageer

TeleAria is a powerful cloud downloader that combines the capabilities of [Aria2](https://aria2.github.io/) with [Telegram](https://telegram.org/). This tool allows you to effortlessly download files, torrents, and videos. TeleAria is designed to be compact and lightweight, while also providing a customizable environment that you can adjust to your liking. Additionally, it can be integrated with media management solutions like [Plex](https://www.plex.tv/) or [Jellyfin](https://jellyfin.org/), enhancing your home media management experience.

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


### **Plex & Jellyfin Integration**

![image](https://github.com/user-attachments/assets/3c8dc81f-7333-4465-9720-bdb7c6ae4bfc)


TeleAria supports seamless media library management. Simply mount your download folder, and point Plex or Jellyfin to this directory:

1. **Mount Download Folder**: Add the `-v` flag during setup to specify the download directory.
   ```bash
   -v /path/to/downloads:/tmp/downloads
   ```
2. **Point Plex or Jellyfin**: 
   - In Plex or Jellyfin, set `/tmp/downloads` as the media folder to automatically access all downloaded content.

### **Stremio Integration**

TeleAria now supports [Stremio](https://www.strem.io/), enabling you to view downloaded content in your Stremio library.

- Manifest URL:
  ```bash
  http://localhost:6799/manifest.json
  ```

![image](https://github.com/user-attachments/assets/bc5c7c05-4823-4643-9e5e-e51b711d416e)

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

If you want only authorized Telegram accounts to have access to content, replace `WHITELISTUSER` with your actual token:
```bash
  # Single user is like 12345, and multiple users must use the separator character: ,
  -e WHITE_LIST_USER=123456,654321
```

```bash
  # You can also mount download folder 
  -v /home/$USER/telearia:/tmp/downloads \

  # You can also set custom url for telearia
  -e TUNNELURL=http://localhost:6799 \
```

### Tunnel Setup

Pair TeleAria with a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) for enhanced self-hosting.

Or you can use something like Serveo as well.

```bash
ssh -R 80:localhost:6799 serveo.net
```
