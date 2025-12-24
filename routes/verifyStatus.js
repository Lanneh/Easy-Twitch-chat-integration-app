import express from "express";
import { getVerificationStatus } from "../twitch/verifyManager.js";

export const verifyStatusRoute = express.Router();

verifyStatusRoute.get("/", (req, res) => {
    const { serverId } = req.query;
    console.log("[verify/status] Received request for serverId:", serverId);

    if (!serverId) {
        console.error("[verify/status] Missing serverId in request");
        return res.status(400).json({ error: "Missing serverId" });
    }

    try {
        const status = getVerificationStatus(serverId);
        console.log("[verify/status] Status returned:", status);
        res.json(status); // { verified: true/false, expired: true/false }
    } catch (err) {
        console.error("[verify/status] Error retrieving status:", err);
        res.status(500).json({ error: err.message });
    }
});
