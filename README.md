# js-ts-discord-bot-minecraft
Discord Bot that communicates with Minecraft Servers

## General Purpose
This program consists of a discord bot that connects to a WebSocket Server inside a Minecraft Server delivered by a mod. It can now participate as a Message-Gateway between the Minecraft- and the discord Server.

<br />
<br />
<br />
<br />
## Installation

#### 1. [Important!] Dotenvx - Encryption of .env-files
The service will not run without encrypting the .env file.
Please proceed with the following Steps and fill in your values from
 - The Discord Developer Portal
 - Your Minecraft Server
   - The Websocket URL of the "websocket-web-chat"-Mod

----------
```
npm install @dotenvx/dotenvx --save

# Fill your .env
# example:
$ echo -e 'DISCORD_TOKEN=< DISCORD-BOT-TOKEN >\n' >> .env
$ echo 'DISCORD_CHANNEL_ID=< DISCORD-CHANNEL-ID >\n' >> .env
$ echo 'WEBSOCKET_URL=< MINECRAFT-WEBSOCKET-WEB-CHAT-WSURL >\n' >> .env
$ echo 'APPLICATION_ID=< APPLICATION-ID >\n' >> .env
$ echo 'PUBLIC_KEY=< APPLICATION PUBLIC KEY >\n' >> .env
$ echo 'MC_SERVER_IP=< MINECRAFT-SERVER-IP >\n' >> .env
$ echo 'MC_SERVER_PORT=< MINECRAFT-SERVER-PORT >\n' >> .env

dotenvx encrypt

```

<br />
<br />

#### 2. Docker-Compose
```
docker-compose up --build -d
```

#### 3. Verify Installation in your Discord Channel
##### If the Servers is up there should arrive a message like:
✅ Server is ONLINE
Players: 0/20

##### If the Server is offline:
⚠️ The Minecraft server is currently OFFLINE.

<br />
<br />
<br />
<br />
<br />
<br />

## Slash Commands

```
/players          -          Returns the Online Status of the Server and the Players Online as a Chat-Message
```


#### CopyRight 2026 - L&S Design
#### Author: Sascha Frank <sfrank@wyl-online.de>
