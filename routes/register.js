import express from "express";
import { registerServer } from "../twitch/clientManager.js";

export const registerRoute = express.Router();

registerRoute.post("/", async (req, res) => {
    const { username, serverId } = req.body;
    if (!username || !serverId) return res.status(400).json({ error: "Missing username or serverId" });

    try {
        await registerServer(username, serverId);
        res.json({ status: "ok", serverId, username });
    } catch (err) {
        res.status(500).json({ error: "Failed to register Twitch client" });
    }
});

