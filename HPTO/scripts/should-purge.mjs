import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config", "purgeConfig.json");
const purgeConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Hora actual en NY
const now = new Date();
const ny = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
}).format(now);

const shouldPurge = ny === purgeConfig.targetTimeNY;

console.log("NY time:", ny);
console.log("Target:", purgeConfig.targetTimeNY);
console.log("DRY RUN shouldPurge:", shouldPurge);
console.log("SurrogateKey (not used yet):", purgeConfig.surrogateKey);
