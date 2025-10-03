#!/bin/bash

# Ensure SAVE_DIR exists
SAVE_DIR=$(node -e "console.log(require('os').tmpdir() + '/telearia')")

mkdir -p "$SAVE_DIR"

echo "Download directory: $SAVE_DIR"

# Generate random SMB credentials
SMB_USER="x$(shuf -i 1000-9999 -n 1)"
SMB_PASS=$(openssl rand -base64 12 | tr -d "=+/" | cut -c1-10)

# Create SMB user and set password
useradd -M -s /bin/false "$SMB_USER"
echo "$SMB_USER:$SMB_PASS" | chpasswd
(echo "$SMB_PASS"; echo "$SMB_PASS") | smbpasswd -a "$SMB_USER"

# Save credentials for the bot to display (outside web-accessible directory)
echo "$SMB_USER:$SMB_PASS" > /var/run/smb_credentials.txt

# Verify credentials file was written correctly
if [ -f /var/run/smb_credentials.txt ]; then
    echo "SMB credentials file created successfully"
    echo "SMB Credentials: $SMB_USER / $SMB_PASS"
else
    echo "ERROR: Failed to create SMB credentials file"
    exit 1
fi

sleep 2

# Create minimal smb.conf for guest access
cat >/etc/samba/smb.conf <<EOL
[global]
   map to guest = Bad User
   guest account = nobody
   server min protocol = SMB2
   disable netbios = yes
   smb ports = 445

[telearia]
   comment = Read-only downloads
   path = $SAVE_DIR
   read only = yes
   guest ok = yes
   force user = nobody
   browseable = yes

[telearia-rw]
   comment = Full access downloads
   path = $SAVE_DIR
   read only = no
   valid users = $SMB_USER
   force user = $SMB_USER
   force group = users
   browseable = yes
   create mask = 0664
   directory mask = 0775
EOL

# Ensure permissions for guest access
chown -R nobody:nogroup "$SAVE_DIR"
chmod -R 0775 "$SAVE_DIR"

# Also set permissions for the authenticated user
chown -R "$SMB_USER":users "$SAVE_DIR"
chmod -R 0775 "$SAVE_DIR"

# Start Samba (SMB) server
smbd --foreground --no-process-group &

sleep 2

aria2c --enable-rpc --rpc-listen-all --rpc-listen-port=6398 --listen-port=6888 \
  --enable-dht=true --enable-peer-exchange=true --seed-time=100 \
  --bt-tracker="udp://tracker.opentrackr.org:1337/announce,udp://open.demonii.com:1337/announce,udp://open.stealth.si:80/announce,udp://exodus.desync.com:6969/announce" &

sleep 2

while true; do
   node app.js
   echo "Bot crashed with exit code $? - restarting in 5 seconds..."
   sleep 7
done
