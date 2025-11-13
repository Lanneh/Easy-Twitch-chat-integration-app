import fetch from "node-fetch";
import { log } from "../utils/logger.js";

export async function validateTwitchChannel(username) {
  try {
    const res = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(username)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    log.error(`Failed to validate Twitch channel "${username}": ${err}`);
    return false;
  }
}
