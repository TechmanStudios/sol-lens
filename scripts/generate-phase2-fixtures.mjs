import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  duplicateIdPacket,
  exploration120Packet,
  legacyV01Packet,
  overview500Packet,
  valid24Packet,
} from "../tests/fixtures/packets.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDirectory = resolve(projectRoot, "public", "fixtures");

await mkdir(fixtureDirectory, { recursive: true });

const fixtures = {
  "valid-24.json": valid24Packet,
  "exploration-120.json": exploration120Packet,
  "overview-500.json": overview500Packet,
  "invalid-duplicate-id.json": duplicateIdPacket,
  "legacy-v0.1.json": legacyV01Packet,
};

await Promise.all(
  Object.entries(fixtures).map(([name, packet]) =>
    writeFile(
      resolve(fixtureDirectory, name),
      `${JSON.stringify(packet, null, 2)}\n`,
      "utf8",
    ),
  ),
);

console.log(`Generated ${Object.keys(fixtures).length} SOL Lens packet fixtures.`);
