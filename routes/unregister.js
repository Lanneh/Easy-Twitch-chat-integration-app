import express from "express";
import { unregisterServer } from "../twitch/clientManager.js";

export const unregisterRoute = express.Router();

unregisterRoute.post("/", async (req, res) => {
  const { serverId } = req.body;
  if (!serverId)
    return res.status(400).json({ error: "Missing serverId" });

  const success = await unregisterServer(serverId);
  res.json({ status: success ? "ok" : "not_found" });
});
