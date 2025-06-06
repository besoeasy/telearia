# TeleAria: Telegram-Controlled Cloud Downloader

TeleAria is a lightweight, self-hosted solution that combines the power of [Aria2](https://aria2.github.io/) and [Telegram](https://telegram.org/) to enable remote downloading of files, torrents, and videos. With real-time updates, bandwidth controls, and seamless sharing via HTTP and Samba (SMB), TeleAria makes it easy to manage and access your downloads from any device.

 ![TeleAria](https://github.com/user-attachments/assets/d5a1ce42-d9e6-41a3-a48a-e926f0d384ca)

---

## Features

- Download files, torrents, and videos via Telegram bot commands
- High-speed, concurrent downloads powered by Aria2
- Real-time progress and status updates in Telegram
- Auto-sorted downloads for easy organization
- Bandwidth and scheduling controls
- Downloads shared via HTTP and Samba (SMB)

---

## Quick Start (Docker)

```bash
docker run -d \
  --name telearia \
  --restart unless-stopped \
  -p 6799:6799 \
  -p 445:445 \
  -e TELEGRAMBOT=Your-Telegram-Bot-Token \
  ghcr.io/besoeasy/telearia:main
```

- **Restrict access:** `-e WHITE_LIST_USER=123456,654321`
- **Mount downloads:** `-v /tmp/telearia:/tmp/telearia`
- **Access via HTTP:** `http://<host>:6799/`

---

## Accessing Downloads

- **HTTP:** Open `http://<host>:6799/` in your browser to browse and download files.
- **Samba (SMB) Share:**
  - Connect to the SMB share from VLC, NOVA Video Player (Android TV), Linux, Windows, or iOS file managers.
  - Network path: `smb://<host>/telearia` (adjust as needed for your setup)

---

## User Access Control

- Restrict Telegram bot access to specific users with the `WHITE_LIST_USER` environment variable (comma-separated Telegram user IDs).

---

## Optional: Tunneling

Expose your TeleAria instance securely over the internet using Cloudflare Tunnel or Serveo:

- **Cloudflare Tunnel:** [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- **Serveo Example:**
  ```bash
  ssh -R 80:localhost:6799 serveo.net
  ```

---

## Environment Variables

- `TELEGRAMBOT`: **(Required)** Your Telegram bot token
- `WHITE_LIST_USER`: Comma-separated list of allowed Telegram user IDs
- Other variables as needed for advanced configuration

---

## Support

For questions, issues, or feature requests, please open an issue on the [GitHub repository](https://github.com/besoeasy/telearia).

---

Enjoy effortless, remote-controlled downloading with TeleAria!
