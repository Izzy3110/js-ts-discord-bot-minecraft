# js-ts-discord-bot-minecraft
Discord Bot that communicates with Minecraft Servers


#### Dotenvx - Encryption of .env-files
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
