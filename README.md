**TeleAria: The Ultimate Telegram-Controlled Aria2 Downloader**

TeleAria is a powerful download manager that seamlessly integrates Aria2's robust downloading capabilities with the convenience of Telegram control. Whether you need to download files, torrents, or videos, TeleAria can handle it all with ease. Here are some of the key features:

- **Comprehensive Download Support**: Download virtually anything, including files, torrents, and videos, with Aria2’s multi-protocol support.
- **Telegram Integration**: Control your downloads directly from your Telegram app. Start, stop, and manage downloads remotely with simple commands.
- **High-Speed Downloads**: Enjoy fast and efficient downloading with Aria2's advanced download acceleration.
- **User-Friendly Interface**: Easy setup and intuitive commands make managing downloads a breeze.
- **Real-Time Notifications**: Get instant updates on your download status, ensuring you’re always in the loop.

With TeleAria, downloading has never been easier or more efficient. Perfect for users who demand flexibility and performance in their download management.

### Install NPM

Install using npm ( Requires Git Installed )

```bash
npm install -G github:besoeasy/telearia
```

Running

```bash
TELEGRAMBOT=your-telegram-bot-token telearia
```

### Install Docker Container:

Replace `your-telegram-bot-token` with your actual Telegram bot token. Also, ensure the `~/Downloads` directory on the host is mounted to `/downloads` in the container.

```bash
docker run -d \
--name telearia \
--restart unless-stopped \
-p 6600:6600 \
-p 6800:6800 \
-p 6881-7999:6881-7999 \
-e TELEGRAMBOT=your-telegram-bot-token \
-v ~/Downloads:/tmp/downloads \
ghcr.io/besoeasy/telearia:main
```

This command does the following:

- `-d`: Runs the container in detached mode (background).
- `--name telearia`: Names the container `telearia` for easy management.
- `-p 6800:6800`: Maps port `6800` on the host to port `6800` in the container for aria2 RPC.
- `-p 6600:6600`: Maps port `6600` on the host to port `6600` in the container for server http.
- `-p 6881-7999:6881-7999`: Maps ports `6881-7999` for BitTorrent.
- `-e TELEGRAMBOT=your-telegram-bot-token`: Sets the environment variable `TELEGRAMBOT` with your Telegram bot token.
- `-v ~/Downloads:/downloads`: Mounts the `~/Downloads` directory on your host to `/downloads` inside the container for downloading files.

Make sure to replace `your-telegram-bot-token` with your actual Telegram bot token before running the Docker container. This readme update reflects pulling the Docker image directly from GitHub Container Registry.


## Pair with Cloudflare tunnel 

To have your own self hosted cloud download manager, controlled via telegram.