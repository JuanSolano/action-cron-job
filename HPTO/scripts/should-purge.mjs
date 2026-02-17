import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config", "purgeConfig.json");
const statePath = path.join(__dirname, "..", ".state", "state.json");

const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Helpers
const pad2 = (n) => String(n).padStart(2, "0");
const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

// Current NY time and date
const now = new Date();
const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
}).formatToParts(now);

const get = (type) => parts.find((p) => p.type === type)?.value;
const yyyy = get("year");
const mm = get("month");
const dd = get("day");
const hh = get("hour");
const min = get("minute");

const nyDate = `${yyyy}-${mm}-${dd}`;
const nyTime = `${hh}:${min}`;

const nowMin = Number(hh) * 60 + Number(min);
const targetMin = toMinutes(cfg.targetTimeNY);
const window = Number(cfg.windowMinutes ?? 0);

const inWindow = nowMin >= targetMin && nowMin <= targetMin + window;

// Load state (to avoid repeating same day)
let state = {};
fs.mkdirSync(path.dirname(statePath), { recursive: true });
if (fs.existsSync(statePath)) {
    try { state = JSON.parse(fs.readFileSync(statePath, "utf8")); } catch {}
}

const alreadyRanToday = state.lastRunNYDate === nyDate;

const shouldPurge = inWindow && !alreadyRanToday;

console.log("NY date:", nyDate);
console.log("NY time:", nyTime);
console.log("Target:", cfg.targetTimeNY, `(+${window}m window)`);
console.log("In window:", inWindow);
console.log("Already ran today:", alreadyRanToday);
console.log("DRY RUN shouldPurge:", shouldPurge);
console.log("SurrogateKey (not used yet):", cfg.surrogateKey);


// If we would purge, persist state (dry-run still updates state so we can test behavior)
if (shouldPurge) {
    fs.writeFileSync(statePath, JSON.stringify({ lastRunNYDate: nyDate }, null, 2));
    console.log("State updated:", statePath);
}

// --- GitHub Actions output (so YAML can conditionally run steps) ---
if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `shouldPurge=${shouldPurge}\n`);
}
