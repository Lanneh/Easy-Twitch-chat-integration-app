import express from "express";
import { validateTwitchChannel } from "../twitch/validateChannel.js";
import { registerServer } from "../twitch/clientManager.js";
import { log } from "../utils/logger.js";

export const registerRoute = express.Router();

registerRoute.post("/", async (req, res) => {
  const { username, serverId } = req.body;
  if (!username || !serverId)
    return res.status(400).json({ error: "Missing username or serverId" });

  const valid = await validateTwitchChannel(username);
  if (!valid)
    return res.status(400).json({ error: "Invalid or suspended Twitch channel" });

  try {
    await registerServer(username, serverId);
    res.json({ status: "ok", serverId, username });
  } catch (err) {
    log.error(`Error registering ${serverId}: ${err}`);
    res.status(500).json({ error: "Failed to connect to Twitch" });
  }
});
