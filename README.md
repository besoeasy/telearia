# Introduction

Telepi is a simple tool that allows you to monitor and control your Raspberry Pi (and other Linux-based systems) via Telegram. It eliminates the need for a dedicated web setup and provides a convenient way to manage your device remotely.

# Features

Telepi offers several features, including:

- Downloading files from HTTP, FTP, and torrent sources
- Monitoring system health, RAM, and storage usage
- Retrieving public and local network IP addresses
- Running speed tests
- Fetching any file

# Installation

To install Telepi, run the following command:

```
sudo bash -c "$(curl -sL https://unpkg.com/telepi)"
```

# Usage

Once installed, you can start using Telepi by sending commands to your Telegram bot. Here are some examples:

- To download a file: `/download <URL>`
- To get system information: `/info`
- To retrieve network IP addresses: `/ip`
- To run a speed test: `/speedtest`
- To fetch a file: `/fetch <FILE_PATH>`

For more information on how to use Telepi, please refer to the documentation.

# Requirements

Telepi requires a Raspberry Pi or other Linux-based system running Debian. It also requires a Telegram account and a Telegram bot token.

# Future Updates

We plan to add more features to Telepi in the future, including support for additional file transfer protocols and improved performance. Stay tuned for updates!
