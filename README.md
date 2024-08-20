# RoyalHosting-DDoS-Alerts

## Prerequisites

- Node.js (>= 10.0.0) -> install it with
```bash
  curl https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash 
  source ~/.bashrc
  nvm install node
  npm install -g npm@latest
```
- `axios` library
- `node-cron` library

## Setup

1. Clone this repository to your local machine.
2. Install the required dependencies using the following command:
```bash
npm install axios node-cron
```
3. Edit the `index.js` file to provide the necessary information.

## Configuration

Open the `index.js` file and fill in the webhook and the authToken (api token) and the discord bot token

## Running the Script

1. Open a terminal and navigate to the directory containing the `index.js` file.
2. Run the script using the following command:
   
   ```sh
   node index.js
   ```
or
## Create a background service
- edit the node version path with the one you get from `which node`
```bash
username="root" # If u dont use root, you have to edit the path to /home/$username
echo -e "[Unit]
Description=datalixStatus
Wants=network-online.target
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
Environment=\"LD_LIBRARY_PATH=./linux64\"
ExecStart=/$username/.nvm/versions/node/v20.5.1/bin/node /$username/index.js
User=$username
Group=$username
StandardOutput=journal
Restart=never
WorkingDirectory=/$username/

[Install]
WantedBy=multi-user.target">/etc/systemd/system/alerts.service
sudo systemctl start alerts
sudo systemctl enable alerts
```
