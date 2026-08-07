import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const destinationsPath = path.join(__dirname, "../data/destinations.json");
const destinations = JSON.parse(fs.readFileSync(destinationsPath, "utf-8"));

export async function getDestination(id) {
  if (!id) return null;
  const key = id.toLowerCase().replace(/\s/g, "");
  return destinations.find(
    (dest) =>
      dest.id.toLowerCase() === key ||
      dest.name.toLowerCase().replace(/\s/g, "") === key
  ) || null;
}