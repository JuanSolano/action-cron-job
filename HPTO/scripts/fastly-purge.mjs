import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "config", "purgeConfig.json");
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

const serviceId = process.env.FASTLY_SERVICE_ID || cfg.fastlyServiceId;
const surrogateKey = cfg.surrogateKey;
const apiKey = process.env.FASTLY_API_KEY;

if (!serviceId) {
    throw new Error("Missing FASTLY_SERVICE_ID (env) or fastlyServiceId (config).");
}
if (!surrogateKey) {
    throw new Error("Missing surrogateKey in config.");
}

// Fastly API endpoint for surrogate-key purge (by service)
const url = `https://api.fastly.com/service/${serviceId}/purge/${encodeURIComponent(surrogateKey)}`;

console.log("Fastly purge request:");
console.log("URL:", url);
console.log("Header: Fastly-Key: [REDACTED]");
console.log("dryRun:", cfg.dryRun);

if (cfg.dryRun) {
    console.log("DRY RUN enabled — not sending request.");
    process.exit(0);
}

if (!apiKey) {
    throw new Error("Missing FASTLY_API_KEY (env). Add it as a GitHub secret and pass via env.");
}

const res = await fetch(url, {
    method: "POST",
    headers: {
        "Fastly-Key": apiKey,
        Accept: "application/json",
    },
});

const bodyText = await res.text();

console.log("Fastly response status:", res.status);

// Log body (usually small JSON); keep it in case we need to debug permissions/serviceId/key issues.
console.log("Fastly response body:", bodyText);

if (!res.ok) {
    process.exit(1);
}
