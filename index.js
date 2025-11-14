import express from "express";
import { log } from "./utils/logger.js";
import { registerRoute } from "./routes/register.js";
import { unregisterRoute } from "./routes/unregister.js";
import { getMessagesRoute } from "./routes/getMessages.js";
import { verifyRoute } from "./routes/verifyRequest.js";

const app = express();
app.use(express.json());

// Mount routes
app.use("/register", registerRoute);
app.use("/unregister", unregisterRoute);
app.use("/getMessages", getMessagesRoute);
app.use("/verifyRequest", verifyRoute);

// Health check
app.get("/", (req, res) => res.send("✅ Twitch Relay Backend is running"));
app.get("/status", (req, res) => res.json({
  uptime: process.uptime(),
  timestamp: new Date().toISOString()
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log.info(`Server running on port ${PORT}`));

