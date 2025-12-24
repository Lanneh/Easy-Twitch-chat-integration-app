import express from "express";
import { log } from "./utils/logger.js";
import { registerRoute } from "./routes/register.js";
import { unregisterRoute } from "./routes/unregister.js";
import { getMessagesRoute } from "./routes/getMessages.js";

// ✅ New non-blocking 2-phase verification routes
import { verifyStartRoute } from "./routes/verifyStart.js";
import { verifyStatusRoute } from "./routes/verifyStatus.js";

const app = express();
app.use(express.json());

// Mount routes
app.use("/register", registerRoute);
app.use("/unregister", unregisterRoute);
app.use("/getMessages", getMessagesRoute);

// 2-phase verification
app.use("/verify/start", verifyStartRoute);
app.use("/verify/status", verifyStatusRoute);

// Health check
app.get("/", (req, res) => res.send("✅ Twitch Relay Backend is running"));
app.get("/status", (req, res) => res.json({
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => log.info(`Server running on port ${PORT}`));
