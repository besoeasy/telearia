# Introduction

Telepi simplifies Raspberry Pi and Linux system management via Telegram, featuring file downloads, system monitoring, network insights, speed tests, and the ability to open HTTP tunnels for efficient remote control

# Features

Telepi offers several features, including:

- Downloading files from HTTP, FTP, and torrent sources
- Monitoring system health, RAM, and storage usage
- Retrieving public and local network IP addresses
- Running speed tests
- Fetching any file

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


# Requirements

Telepi requires a Raspberry Pi or other Linux-based system running Debian. It also requires a Telegram account and a Telegram bot token.

# Future Updates

We plan to add more features to Telepi in the future, including support for additional file transfer protocols and improved performance. Stay tuned for updates!
