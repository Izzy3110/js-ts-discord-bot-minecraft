import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import WebSocket from 'ws';
import { config } from './config';
import { MinecraftMonitor } from './monitor';
import path from 'path';
import fs from 'fs';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
});

let ws: WebSocket;

function connectWebSocket() {
    ws = new WebSocket(config.websocketUrl);

    ws.on('open', () => {
        console.log('Connected to WebSocket server');
    });

    ws.on('message', async (data) => {
        const message = data.toString();

        if (message.startsWith('PLAYER_LIST:')) return;

        console.log('Received message:', message);

        try {
            const channel = await client.channels.fetch(config.discordChannelId);
            if (channel && channel.isTextBased()) {
                await (channel as TextChannel).send(message);
            } else {
                console.error(`Discord channel not found or is not a text channel (ID: ${config.discordChannelId})`);
            }
        } catch (error: any) {
            console.error('Error sending message to Discord:', error);
            if (error.code === 50001) {
                console.error('Hint: The bot is missing access to the channel. Please ensure the bot is added to the server and has "View Channel" and "Send Messages" permissions for the specified channel.');
            }
        }
    });

    ws.on('close', () => {
        console.log('WebSocket disconnected. Reconnecting in 5 seconds...');
        setTimeout(connectWebSocket, 5000);
    });

    ws.on('error', (err) => {
        console.error('WebSocket error:', err);
        ws.close();
    });
}

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    connectWebSocket();

    // Start Minecraft Server Monitor
    const monitor = new MinecraftMonitor(client);
    monitor.start();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'players') {
        const statusPath = path.join(process.cwd(), 'data', 'lastStatus.json');

        try {
            if (fs.existsSync(statusPath)) {
                const statusData = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));

                if (statusData.status === 'online' && statusData.data) {
                    const players = statusData.data.players;
                    const onlineCount = players?.online || 0;
                    const maxPlayers = players?.max || 0;
                    const sample = players?.sample || [];

                    let replyMessage = `✅ **Server is ONLINE**\nPlayers: ${onlineCount}/${maxPlayers}`;

                    if (sample.length > 0) {
                        const playerNames = sample.map((p: any) => p.name).join(', ');
                        replyMessage += `\nOnline Players: ${playerNames}`;
                    } else if (onlineCount > 0) {
                        replyMessage += `\n(No player names available)`;
                    }

                    await interaction.reply(replyMessage);
                } else {
                    await interaction.reply('⚠️ The Minecraft server is currently **OFFLINE**.');
                }
            } else {
                await interaction.reply('❓ Status data unavailable. The bot is still collecting data.');
            }
        } catch (error) {
            console.error('Error reading status file:', error);
            await interaction.reply('❌ An error occurred while fetching player data.');
        }
    }
});

client.login(config.discordToken);
