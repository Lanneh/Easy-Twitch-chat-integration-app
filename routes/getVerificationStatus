import express from "express";
import { getVerificationStatus } from "../twitch/verifyManager.js";

export const verifyStatusRoute = express.Router();

verifyStatusRoute.get("/", (req, res) => {
    const { serverId } = req.query;
    if (!serverId) return res.status(400).json({ error: "Missing serverId" });

    try {
        const verified = getVerificationStatus(serverId);
        res.json({ verified });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
