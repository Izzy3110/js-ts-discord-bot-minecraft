import { Client, TextChannel } from 'discord.js';
import { config } from './config';
import { queryMinecraftServer } from './minecraftPing';
import fs, { stat, writeFileSync } from "node:fs";
import path from "node:path";
import { unixTimestampMs } from './utils';

export interface statusJson {
    status: "online" | "offline";
    timestamp: number;
    data?: any;
}


export class MinecraftMonitor {
    private client: Client;
    private isOnline: boolean | null = null;
    private checkTimeout: NodeJS.Timeout | null = null;
    private lastOfflineNotificationTime: number = 0;
    private readonly OFFLINE_NOTIFICATION_INTERVAL = 2 * 60 * 1000; // 2 minutes
    public startReported: boolean = false;

    constructor(client: Client) {
        this.client = client;
    }

    public start() {
        console.log(`Starting Minecraft monitor for ${config.mcServerIp}:${config.mcServerPort}`);
        // Initial check
        this.check(true);
    }

    private async check(isStartup: boolean = false) {
        try {
            const result = await queryMinecraftServer(config.mcServerIp, config.mcServerPort);
            let statusJson: statusJson = {
                "status": "online",
                "timestamp": unixTimestampMs(),
                "data": result
            }
            writeFileSync(path.join(process.cwd(), "data", "lastStatus.json"), JSON.stringify(statusJson, null, 4));
            this.handleOnline(result, isStartup);
        } catch (error) {
            let statusJson: statusJson = {
                "status": "offline",
                "timestamp": unixTimestampMs()
            }
            writeFileSync(path.join(process.cwd(), "data", "lastStatus.json"), JSON.stringify(statusJson, null, 4));
            this.handleOffline(isStartup);
        }
    }

    private handleOnline(result: any, isStartup: boolean = false) {
        if (this.isOnline !== true) {

            this.isOnline = true;
            if (isStartup) {
                console.log('Server is ONLINE');
                const players = result.players?.online || 0;
                const maxPlayers = result.players?.max || 0;
                const playerNames = [];
                const sample = result.players?.sample || [];
                for (const playerName of sample) {
                    playerNames.push(playerName.name);
                }
                let playerNamesString = "";
                if (playerNames.length > 0) {
                    playerNamesString = "(" + playerNames.join(", ") + ")";
                }
                this.sendDiscordMessage(`✅ **Server is UP!**\nPlayers: ${players}/${maxPlayers}\n${playerNamesString}`);
                this.startReported = true;
            }
        }

        // Schedule next check in 1 minute
        this.scheduleCheck(60000);
    }

    private handleOffline(isStartup: boolean) {
        const now = Date.now();

        if (this.isOnline !== false) {
            // Transition to offline (or offline at start)
            console.log('Server is OFFLINE');
            this.isOnline = false;

            // this.sendDiscordMessage('⚠️ **The Minecraft server is currently OFFLINE!**');
            this.lastOfflineNotificationTime = now;
        } else {
            // Already offline, check reminder
            if (now - this.lastOfflineNotificationTime >= this.OFFLINE_NOTIFICATION_INTERVAL) {
                console.log('Sending offline reminder...');
                // this.sendDiscordMessage('⚠️ **Reminder:** The Minecraft server is still OFFLINE.');
                this.lastOfflineNotificationTime = now;
            }
        }

        // Schedule next check in 30 seconds
        this.scheduleCheck(30000);
    }

    private scheduleCheck(delay: number) {
        if (this.checkTimeout) clearTimeout(this.checkTimeout);
        this.checkTimeout = setTimeout(() => this.check(), delay);
    }

    private async sendDiscordMessage(content: string) {
        try {
            const channel = await this.client.channels.fetch(config.discordChannelId);
            if (channel && channel.isTextBased()) {
                await (channel as TextChannel).send(content);
            } else {
                console.error(`Discord channel not found or is not a text channel (ID: ${config.discordChannelId})`);
            }
        } catch (error) {
            console.error('Error sending message to Discord:', error);
        }
    }
}
