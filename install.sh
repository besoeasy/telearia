#!/bin/bash
set -e

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Function to install a package
install_package() {
    sudo apt-get update -y
    sudo apt-get install -y "$1"
}

# Check for sudo privileges
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo."
    exit 1
fi

# Update and install necessary packages
install_package ca-certificates
install_package curl
install_package gnupg
install_package aria2

# Check and install Node.js
if command_exists node; then
    echo "Node.js is already installed."
else
    # Install Node.js from NodeSource repository
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    NODE_MAJOR=20
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    install_package nodejs
    node --version
    echo "Node.js installation complete!"
fi

# Check and install npm
if ! command_exists npm; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Check and update telepi
if command_exists telepi; then
    sudo systemctl stop telepi.service
    sudo npm install -g telepi@latest
    sudo systemctl start telepi.service
    echo "Telepi service stopped, updated, and started again."
else
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
    if grep -q "TELEGRAMBOT" /etc/environment; then
        sudo sed -i '/TELEGRAMBOT/d' /etc/environment
    fi
    echo "export TELEGRAMBOT=$TELEGRAMBOT" | sudo tee -a /etc/environment

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
