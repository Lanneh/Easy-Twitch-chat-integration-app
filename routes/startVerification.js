import express from "express";
import { startVerification } from "../twitch/verifyManager.js"; // new function

export const verifyStartRoute = express.Router();

verifyStartRoute.post("/", (req, res) => {
    const { username, serverId } = req.body;
    if (!username || !serverId) return res.status(400).json({ error: "Missing username or serverId" });

    try {
        const code = startVerification(username, serverId);
        res.json({ code });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
