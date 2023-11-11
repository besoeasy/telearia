#!/bin/bash

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

    # Update and upgrade the system
    sudo apt-get update && sudo apt-get upgrade -y

    # Install Node.js 18.x, npm, and aria2
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs aria2 curl wget

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
    echo "export TELEGRAMBOT=$TELEGRAMBOT" >> ~/.bashrc

    # Reload the shell environment
    source ~/.bashrc

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
