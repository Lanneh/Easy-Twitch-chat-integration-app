import { connectTwitch } from "./clientManager.js";
import { log } from "../utils/logger.js";

export const pendingConnections = {}; // serverId -> { username, timeout, resolve }

export async function requestVerification(username, serverId, timeoutSeconds = 60) {
    return new Promise((resolve, reject) => {
        // Save pending connection
        pendingConnections[serverId] = {
            username,
            timeout: Date.now() + timeoutSeconds * 1000,
            resolve
        };

        log.info(`[Twitch] Verification requested for ${username} (server ${serverId})`);

        // Setup timeout
        setTimeout(() => {
            if (pendingConnections[serverId]) {
                delete pendingConnections[serverId];
                log.warn(`[Twitch] Verification timed out for ${username} (server ${serverId})`);
                reject(new Error("Verification timed out"));
            }
        }, timeoutSeconds * 1000);
    });
}

// Call this when a Twitch message is received
export function checkVerificationMessage(channel, message) {
    // find pending connection for this channel
    for (const serverId in pendingConnections) {
        const pending = pendingConnections[serverId];
        if (pending.username.toLowerCase() === channel.toLowerCase() && message.toLowerCase() === "accept") {
            log.info(`[Twitch] Verification ACCEPT received for ${channel} (server ${serverId})`);
            pending.resolve(true);
            delete pendingConnections[serverId];
        }
    }
}
