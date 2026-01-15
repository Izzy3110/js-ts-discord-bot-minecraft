import dotenv from 'dotenv';
dotenv.config();

export const config = {
    discordToken: process.env.DISCORD_TOKEN as string,
    discordChannelId: process.env.DISCORD_CHANNEL_ID as string,
    websocketUrl: process.env.WEBSOCKET_URL as string,
    mcServerIp: process.env.MC_SERVER_IP as string,
    mcServerPort: parseInt(process.env.MC_SERVER_PORT || '25565'),
};

if (!config.discordToken || !config.discordChannelId || !config.websocketUrl || !config.mcServerIp || !config.mcServerPort) {
    console.error('Missing environment variables. Please check .env file.');
    process.exit(1);
}
