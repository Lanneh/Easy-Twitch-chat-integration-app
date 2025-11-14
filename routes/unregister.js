import express from "express";
import { unregisterServer } from "../clientManager.js";

export const unregisterRoute = express.Router();

unregisterRoute.post("/", async (req, res) => {
    const { serverId } = req.body;
    if (!serverId) return res.status(400).json({ error: "Missing serverId" });

    const success = await unregisterServer(serverId);
    if (success) res.json({ status: "ok" });
    else res.status(500).json({ error: "Failed to unregister Twitch client" });
});
