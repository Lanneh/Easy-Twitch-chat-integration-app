import tmi from "tmi.js";
import { log } from "../utils/logger.js";

export const activeServers = {};
const MAX_MESSAGES = 500;

export async function connectTwitch(username, serverId) {
  const client = new tmi.Client({
    channels: [username.toLowerCase()],
    connection: { reconnect: true, secure: true },
    options: { debug: false },
  });

  client.on("message", (channel, tags, message, self) => {
    // Check pending verification first
    import("./verifyManager.js").then(vm => vm.checkVerificationMessage(channel, message));

    if (!activeServers[serverId]) return;
    const user = tags["display-name"] || tags.username || "unknown";
    const entry = { user, text: message, timestamp: Date.now() };

    const server = activeServers[serverId];
    server.messages.push(entry);
    if (server.messages.length > 500) server.messages.shift();
});


  client.on("disconnected", (reason) =>
    log.warn(`Twitch client disconnected (${serverId}): ${reason}`)
  );
  client.on("error", (err) =>
    log.error(`Twitch client error (${serverId}): ${err}`)
  );

  let attempts = 0;
  while (attempts < 3) {
    try {
      await client.connect();
      log.info(`Connected to Twitch channel: ${username} (server ${serverId})`);
      return client;
    } catch (err) {
      attempts++;
      log.warn(`Retrying connection (${attempts}/3): ${err}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error(`Failed to connect to Twitch channel: ${username}`);
}

export async function registerServer(username, serverId) {
  // Cleanup old client if any
  if (activeServers[serverId]) {
    log.info(`Replacing old Twitch client for ${serverId}`);
    try {
      await activeServers[serverId].client.disconnect();
    } catch (err) {
      log.warn(`Failed to disconnect old client: ${err}`);
    }
    delete activeServers[serverId];
  }

  const client = await connectTwitch(username, serverId);
  activeServers[serverId] = { client, username, messages: [] };
  return activeServers[serverId];
}

export async function unregisterServer(serverId) {
  if (!activeServers[serverId]) return false;

  try {
    await activeServers[serverId].client.disconnect();
    delete activeServers[serverId];
    log.info(`Unregistered Twitch client for ${serverId}`);
    return true;
  } catch (err) {
    log.error(`Error unregistering ${serverId}: ${err}`);
    return false;
  }
}

export function getServerMessages(serverId) {
  if (!activeServers[serverId]) return [];
  const msgs = activeServers[serverId].messages.splice(0);
  return msgs;
}

