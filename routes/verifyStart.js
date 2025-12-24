import express from "express";
import { startVerification } from "../twitch/verifyManager.js";

export const verifyStartRoute = express.Router();

verifyStartRoute.post("/", (req, res) => {
    const { username, serverId } = req.body;

    console.log("[verify/start] Received payload:", req.body);

    if (!username || !serverId) {
        console.error("[verify/start] Missing username or serverId");
        return res.status(400).json({ error: "Missing username or serverId" });
    }

    try {
        const code = startVerification(username, serverId);
        console.log(`[verify/start] Verification code generated: ${code} for ${username}`);
        res.json({ code });
    } catch (err) {
        console.error("[verify/start] Error in startVerification:", err);
        res.status(500).json({ error: err.message });
    }
});
