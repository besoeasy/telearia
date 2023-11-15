#!/bin/bash
set -e

# Check for sudo privileges
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo."
    exit 1
fi

# Check if snap is installed
if ! command -v snap &> /dev/null; then
    # Install snap
    sudo apt-get update
    sudo apt-get install -y snapd
fi

# Check if telepi is installed
if command -v telepi &> /dev/null; then
    # Telepi is installed, stop the service
    sudo systemctl stop telepi.service

    # Update telepi from npmjs
    sudo npm install -g telepi@latest

    # Start the telepi service again
    sudo systemctl start telepi.service

    echo "Telepi service stopped, updated, and started again."
else
    # Telepi is not installed, proceed with installation

    # Install Node.js using snap
    sudo snap install node --channel=18/stable --classic

    # Install aria2 using snap
    sudo snap install aria2

    # Prompt user for TELEGRAMBOT variable with regex check
    while true; do
      read -p "Please enter your Telegram bot token: " TELEGRAMBOT
      if [[ $TELEGRAMBOT =~ ^[0-9]{9,10}:[A-Za-z0-9_-]{35}$ ]]; then
        break
      else
        echo "Invalid Telegram bot token. Please try again."
      fi
    done

    # Set TELEGRAMBOT as an environment variable
    echo "export TELEGRAMBOT=$TELEGRAMBOT" >> /etc/environment

    # Install telepi globally
    sudo npm install -g telepi

    # Create telepi systemd service
    sudo tee /etc/systemd/system/telepi.service >/dev/null <<EOF
[Unit]
Description=telepi Service
After=network.target

[Service]
ExecStart=/usr/bin/env telepi
Restart=always
Environment="TELEGRAMBOT=$TELEGRAMBOT"

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd daemon and enable telepi service
    sudo systemctl daemon-reload
    sudo systemctl enable telepi.service

    echo "telepi installation and service setup complete!"
fi
