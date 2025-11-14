import tmi from "tmi.js";
import { activeServers } from "./clientManager.js";

export const pendingConnections = {}; // serverId -> { username, client, resolve }

export async function requestVerification(username, serverId, timeoutSeconds = 60) {
    return new Promise(async (resolve, reject) => {
        // Create temporary Twitch client
        const client = new tmi.Client({
            channels: [username.toLowerCase()],
            connection: { reconnect: false, secure: true },
            options: { debug: false }
        });

        client.on("message", (channel, tags, message, self) => {
            if (message.toLowerCase() === "accept") {
                resolve(true);
                client.disconnect();
                delete pendingConnections[serverId];
            }
        });

        client.on("connected", () => console.log(`[Twitch] Verification listener connected for ${username}`));
        client.on("disconnected", () => console.log(`[Twitch] Verification listener disconnected for ${username}`));
        client.on("error", (err) => console.error(`[Twitch] Verification listener error for ${username}:`, err));

        pendingConnections[serverId] = { username, client, resolve };

        try {
            await client.connect();
        } catch (err) {
            delete pendingConnections[serverId];
            return reject(err);
        }

        // Auto timeout
        setTimeout(() => {
            if (pendingConnections[serverId]) {
                client.disconnect();
                delete pendingConnections[serverId];
                reject(new Error("Verification timed out"));
            }
        }, timeoutSeconds * 1000);
    });
}
