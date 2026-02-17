import { purgeConfig } from "../config/purgeConfig.ts";

// Hora actual en NY
const now = new Date();
const ny = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
}).format(now);

const shouldPurge = ny === purgeConfig.targetTimeNY;

console.log("NY time:", ny);
console.log("Target:", purgeConfig.targetTimeNY);
console.log("DRY RUN shouldPurge:", shouldPurge);
