import tmi from "tmi.js";

// Store active verifications: serverId -> { username, code, verified, expired, client }
export const pendingConnections = {};

// Helper to generate a random 6-character uppercase code
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Start verification for a Twitch user
export function startVerification(username, serverId, timeoutSeconds = 60) {
    const code = generateCode();
    const expected = `confirm ${code}`.toLowerCase();

    const client = new tmi.Client({
        channels: [username.toLowerCase()],
        connection: { reconnect: false, secure: true },
        options: { debug: true } // enable debug logging for TMI
    });

    pendingConnections[serverId] = {
        username,
        code,
        verified: false,
        expired: false,
        client
    };

    // Listen for the confirm message
    client.on("message", (channel, tags, message) => {
        if (message.toLowerCase().trim() === expected) {
            pendingConnections[serverId].verified = true;
            client.disconnect();
            console.log(`[Twitch] VERIFIED ${username} (${serverId})`);
        }
    });

    // Connect safely
    try {
        client.connect().catch(err => {
            console.error(`[Twitch] client.connect() rejected for ${username}:`, err);
            pendingConnections[serverId].expired = true;
        });
    } catch (err) {
        console.error(`[Twitch] client.connect() threw synchronously for ${username}:`, err);
        pendingConnections[serverId].expired = true;
        throw err;
    }

    // Timeout handling
    setTimeout(() => {
        const pending = pendingConnections[serverId];
        if (pending && !pending.verified) {
            pending.expired = true;
            client.disconnect();
            console.log(`[Twitch] TIMEOUT ${username}`);
        }
    }, timeoutSeconds * 1000);

    console.log(`[Twitch] startVerification setup complete for ${username}, code: ${code}`);
    return code;
}

// Check verification status
export function getVerificationStatus(serverId) {
    const pending = pendingConnections[serverId];
    if (!pending) return { verified: false, expired: true };
    return { verified: pending.verified, expired: pending.expired };
}
