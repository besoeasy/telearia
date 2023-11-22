#!/bin/bash
set -e

# Check for sudo privileges
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root or with sudo."
    exit 1
fi

sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg aria2

# Check if telepi is installed
if command -v telepi &> /dev/null; then

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        echo "npm is not installed. Please install npm first."
        exit 1
    fi


    # Telepi is installed, stop the service
    sudo systemctl stop telepi.service

    # Update telepi from npmjs
    sudo npm install -g telepi@latest

    # Start the telepi service again
    sudo systemctl start telepi.service

    echo "Telepi service stopped, updated, and started again."
else
    # Telepi is not installed, proceed with installation


# Update system and install dependencies
sudo apt-get update -y

# Install Node.js from NodeSource repository
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list

# Update and install Node.js
sudo apt-get update && apt-get install nodejs -y

# Check Node.js version
node --version

echo "Node.js installation complete!"


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
