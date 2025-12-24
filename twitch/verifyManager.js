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
        expired: false, // new flag
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
        const pending = pendingConnections[serverId];
        if (pending && !pending.verified) {
            pending.expired = true;          // mark as expired
            client.disconnect();
            console.log(`[Twitch] TIMEOUT ${username}`);
        }
    }, timeoutSeconds * 1000);

    return code;
}

// Updated status check
export function getVerificationStatus(serverId) {
    const pending = pendingConnections[serverId];
    if (!pending) return { verified: false, expired: true };
    return { verified: pending.verified, expired: pending.expired };
}
