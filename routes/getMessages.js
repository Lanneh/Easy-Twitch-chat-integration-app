import express from "express";
import { getServerMessages } from "../twitch/clientManager.js";

export const getMessagesRoute = express.Router();

getMessagesRoute.get("/", (req, res) => {
  const { serverId } = req.query;
  if (!serverId) return res.status(400).json({ error: "Missing serverId" });

  const messages = getServerMessages(serverId);
  res.json(messages);
});
