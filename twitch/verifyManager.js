import tmi from "tmi.js";

/**
 * serverId -> {
 *   username: string,
 *   code: string,
 *   client: tmi.Client,
 *   resolve: Function
 * }
 */
export const pendingConnections = {};

/* Generate a short, readable verification code */
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Starts a Twitch verification session.
 * RETURNS the generated code immediately.
 * The Promise resolves TRUE when the user confirms.
 */
export async function requestVerification(username, serverId, timeoutSeconds = 60) {
    const code = generateCode();
    const expectedMessage = `confirm ${code}`.toLowerCase();

    const client = new tmi.Client({
        channels: [username.toLowerCase()],
        connection: { reconnect: false, secure: true },
        options: { debug: false }
    });

    return new Promise(async (resolve, reject) => {
        client.on("message", (channel, tags, message, self) => {
            if (message.toLowerCase().trim() === expectedMessage) {
                console.log(`[Twitch] Verification SUCCESS for ${username} (${serverId})`);
                resolve(true);
                client.disconnect();
                delete pendingConnections[serverId];
            }
        });

        client.on("connected", () =>
            console.log(`[Twitch] Verification listener connected for ${username}`)
        );

        client.on("disconnected", () =>
            console.log(`[Twitch] Verification listener disconnected for ${username}`)
        );

        client.on("error", (err) =>
            console.error(`[Twitch] Verification listener error for ${username}:`, err)
        );

        pendingConnections[serverId] = {
            username,
            code,
            client,
            resolve
        };

        try {
            await client.connect();
        } catch (err) {
            delete pendingConnections[serverId];
            return reject(err);
        }

        setTimeout(() => {
            if (pendingConnections[serverId]) {
                console.log(`[Twitch] Verification TIMEOUT for ${username}`);
                client.disconnect();
                delete pendingConnections[serverId];
                reject(new Error("Verification timed out"));
            }
        }, timeoutSeconds * 1000);
    });
}

/**
 * Optional global listener support (if you already have one)
 */
export function checkVerificationMessage(channel, message) {
    for (const serverId in pendingConnections) {
        const pending = pendingConnections[serverId];
        const expectedMessage = `confirm ${pending.code}`.toLowerCase();

        if (
            pending.username.toLowerCase() === channel.toLowerCase() &&
            message.toLowerCase().trim() === expectedMessage
        ) {
            console.log(`[Twitch] Verification SUCCESS for ${channel} (server ${serverId})`);
            pending.resolve(true);
            pending.client.disconnect();
            delete pendingConnections[serverId];
        }
    }
}
