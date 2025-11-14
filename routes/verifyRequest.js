import express from "express";
import { requestVerification } from "../twitch/verifyManager.js";

export const verifyRoute = express.Router();

verifyRoute.post("/", async (req, res) => {
    const { username, serverId } = req.body;
    if (!username || !serverId)
        return res.status(400).json({ error: "Missing username or serverId" });

    try {
        await requestVerification(username, serverId);
        res.json({ status: "verified", username, serverId });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
