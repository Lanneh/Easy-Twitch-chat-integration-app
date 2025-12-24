import tmi from "tmi.js";

export const pendingConnections = {}; // serverId -> { username, code, verified, client }

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function startVerification(username, serverId, timeoutSeconds = 60) {
    const code = generateCode();
    const expected = `confirm ${code}`.toLowerCase();

    const client = new tmi.Client({
        channels: [username.toLowerCase()],
        connection: { reconnect: false, secure: true },
        options: { debug: false }
    });

    pendingConnections[serverId] = {
        username,
        code,
        verified: false,
        client
    };

    client.on("message", (channel, tags, message) => {
        if (message.toLowerCase().trim() === expected) {
            pendingConnections[serverId].verified = true;
            client.disconnect();
            console.log(`[Twitch] VERIFIED ${username} (${serverId})`);
        }
    });

    client.connect();

    setTimeout(() => {
        if (pendingConnections[serverId] && !pendingConnections[serverId].verified) {
            client.disconnect();
            delete pendingConnections[serverId];
            console.log(`[Twitch] TIMEOUT ${username}`);
        }
    }, timeoutSeconds * 1000);

    return code; // immediately return the code to Roblox
}

export function getVerificationStatus(serverId) {
    return !!pendingConnections[serverId]?.verified;
}
