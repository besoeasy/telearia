# TeleAria: Telegram-Controlled Cloud Downloader

TeleAria is a lightweight, self-hosted solution that combines the power of [Aria2](https://aria2.github.io/) and [Telegram](https://telegram.org/) to enable remote downloading of files, torrents, and videos. With real-time updates, bandwidth controls, and seamless sharing via HTTP and Samba (SMB), TeleAria makes it easy to manage and access your downloads from any device.

![TeleAria](https://github.com/user-attachments/assets/d5a1ce42-d9e6-41a3-a48a-e926f0d384ca)

## Features

- Download files, torrents, and videos via Telegram bot commands
- High-speed, concurrent downloads powered by Aria2
- Real-time progress and status updates in Telegram
- Integrated IMDB & Torrentino
- Auto-sorted downloads for easy organization
- Bandwidth and scheduling controls
- Downloads shared via HTTP and Samba (SMB)

## Full Version (Recommended)

```bash
docker run -d \
  --name telearia \
  --restart unless-stopped \
  --network host \
  -e TELEGRAMBOT=telegram-bot-token \
  ghcr.io/besoeasy/telearia:main
```

## Port Mapped Version

```bash
docker run -d \
  --name telearia \
  --restart unless-stopped \
  -p 6799:6799 \
  -p 445:445 \
  -p 6888:6888/tcp \
  -p 6888:6888/udp \
  -e TELEGRAMBOT=your-telegram-bot-token \
  ghcr.io/besoeasy/telearia:main
```

- **Restrict access:** `-e WHITE_LIST_USER=123456,654321`
- **Persistence on Reboot:** `-v telearia-data:/tmp/telearia`

## Accessing Downloads

- **HTTP:** Open `http://<host>:6799/` in your browser to browse and download files.
- **Samba (SMB) Share:**
  - Connect to the SMB share from VLC, NOVA Video Player (Android TV), Linux, Windows, or iOS file managers.
  - Network path: `smb://<host>/telearia` (adjust as needed for your setup).
