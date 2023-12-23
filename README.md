# Introduction

Telepi simplifies Raspberry Pi and Linux system management via Telegram, featuring file downloads, system monitoring, network insights, speed tests, and the ability to open HTTP tunnels for efficient remote control

# Features
- Downloading files from HTTP, FTP, and torrent sources
- Monitoring system health, RAM, and storage usage
- Retrieving public and local network IP addresses
- Running speed tests
- Fetching any file

## Requirements

1. A Telegram bot token. Follow the steps below to create a Telegram bot and get the token:

   - Open the Telegram app and search for the 'BotFather' bot.
   - Start a chat with BotFather by clicking the 'Start' button.
   - Type '/newbot' and send it. BotFather will ask you for a name for your bot. Provide a name.
   - Next, BotFather will ask for a username for your bot. The username must end in 'bot'. For example, 'my_test_bot'.
   - Once you've provided the username, BotFather will give you a token for your bot. Keep this token safe as you'll need it.

2. Run the installation script. It will ask for the Telegram bot token. Provide the token you got from BotFather.

# Installation

To install or update Telepi, run the following command:

```
sudo bash -c "$(curl -sL https://unpkg.com/telepi)"
```

# Usage

Once installed, you can start using Telepi by sending commands to your Telegram bot. Here are some examples:

### About

- **Command**: `/about`
- **Description**: Get information about the TelePI project.
- **Example**: `/about`

### Start

- **Command**: `/start`
- **Description**: Start the bot and check TelePI versions.
- **Example**: `/start`

### Stats

- **Command**: `/stats`
- **Description**: Get server statistics, including uptime, memory usage, and download/upload speed.
- **Example**: `/stats`

### IP

- **Command**: `/ip`
- **Description**: Get local and public IP information.
- **Example**: `/ip`

### Tunnels

- **Command**: `/tunnels`
- **Description**: Get information about open tunnels.
- **Example**: `/tunnels`

### Open Tunnel

- **Command**: `/open {port}`
- **Description**: Open a tunnel on the specified port.
- **Example**: `/open 8080`

### Download

- **Command**: `/download {url}`
- **Alias**: `/dl {url}`
- **Description**: Start a download with Aria2.
- **Example**: `/download https://example.com/file.zip`

### Ongoing

- **Command**: `/ongoing`
- **Description**: Get information about ongoing downloads, including their unique identifiers (GIDs).
- **Example**: `/ongoing`

### Status

- **Command**: `/status_{downloadId}`
- **Description**: Get the status of a download.
- **Example**: `/status_123`

### Cancel

- **Command**: `/cancel_{downloadId}`
- **Description**: Cancel a download.
- **Example**: `/cancel_123`

### Downloads

- **Command**: `/downloads`
- **Description**: Get the HTTP server URL for downloading files.
- **Example**: `/downloads`
