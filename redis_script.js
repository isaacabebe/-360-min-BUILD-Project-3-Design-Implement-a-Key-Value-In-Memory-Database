// ============================================================
// PatchNotes — Redis Implementation Script
// CS3200 — Project 3 | Isaac Abebe
// Implements all three Redis data structures with full CRUD
//
// Prerequisites:
//   docker run -d --name redis -p 6379:6379 redis:latest
//   npm install redis
//
// Run:
//   node redis_script.js
// ============================================================

import { createClient } from "redis";

const client = createClient({ url: "redis://localhost:6379" });

client.on("error", (err) => console.error("Redis error:", err));

await client.connect();
console.log("Connected to Redis\n");

// ── SETUP: flush everything for a clean demo run ─────────────
await client.flushAll();
console.log("── FLUSHALL: cleared Redis ──\n");

// ============================================================
// SORTED SET — Meta Score Leaderboard
// Key: leaderboard:<game_title>
// ============================================================

console.log("════ SORTED SET: Leaderboard ════");

// CREATE — seed initial scores
await client.zAdd("leaderboard:Valorant", [
  { score: 7.5, value: "jett" },
  { score: 3.0, value: "operator" },
  { score: 6.0, value: "sage" },
  { score: 4.0, value: "vandal" },
  { score: 7.0, value: "phantom" },
]);
await client.zAdd("leaderboard:ApexLegends", [
  { score: 7.0, value: "wraith" },
  { score: 5.5, value: "gibraltar" },
  { score: 7.0, value: "lifeline" },
]);
console.log("CREATE — Leaderboards seeded");

// READ — full leaderboard highest to lowest
const valorantBoard = await client.zRangeWithScores(
  "leaderboard:Valorant", 0, -1, { REV: true }
);
console.log("\nREAD — Valorant leaderboard (highest to lowest):");
valorantBoard.forEach((entry, i) =>
  console.log(`  ${i + 1}. ${entry.value} — ${entry.score}`)
);

// READ — rank of a specific entry
const jettRank = await client.zRevRank("leaderboard:Valorant", "jett");
console.log(`\nREAD — Jett's rank in Valorant: #${jettRank + 1}`);

// UPDATE — new rating comes in, update jett's score
await client.zIncrBy("leaderboard:Valorant", 0.5, "jett");
const updatedScore = await client.zScore("leaderboard:Valorant", "jett");
console.log(`UPDATE — Jett's score after new rating: ${updatedScore}`);

// DELETE — remove operator from leaderboard (weapon disabled)
await client.zRem("leaderboard:Valorant", "operator");
const afterDelete = await client.zRange("leaderboard:Valorant", 0, -1, { REV: true });
console.log(`DELETE — Removed operator. Remaining: [${afterDelete.join(", ")}]`);

// ============================================================
// HASH — Active User Sessions
// Key: session:<username>
// ============================================================

console.log("\n════ HASH: Active Sessions ════");

// CREATE — log users in
await client.hSet("session:isaac_a", {
  username: "isaac_a",
  logged_in_at: "2024-03-01T10:00:00",
  last_active: "2024-03-01T10:00:00",
  game_focus: "Valorant",
});
await client.hSet("session:patchgod99", {
  username: "patchgod99",
  logged_in_at: "2024-03-01T10:05:00",
  last_active: "2024-03-01T10:05:00",
  game_focus: "Apex Legends",
});
console.log("CREATE — Sessions created for isaac_a and patchgod99");

// READ — get all session data for a user
const session = await client.hGetAll("session:isaac_a");
console.log("\nREAD — Full session for isaac_a:");
console.log("  ", session);

// READ — get single field
const gameFocus = await client.hGet("session:isaac_a", "game_focus");
console.log(`\nREAD — isaac_a is currently browsing: ${gameFocus}`);

// UPDATE — update last active time and game focus
await client.hSet("session:isaac_a", {
  last_active: "2024-03-01T10:45:00",
  game_focus: "Apex Legends",
});
const updated = await client.hGetAll("session:isaac_a");
console.log("UPDATE — isaac_a switched to Apex Legends:");
console.log("  ", updated);

// CHECK — is patchgod99 still active?
const exists = await client.exists("session:patchgod99");
console.log(`\nCHECK — patchgod99 session exists: ${exists === 1}`);

// DELETE — log isaac_a out
await client.del("session:isaac_a");
const afterLogout = await client.exists("session:isaac_a");
console.log(`DELETE — Logged out isaac_a. Session exists: ${afterLogout === 1}`);

// ============================================================
// LIST — Recent Patches Feed
// Key: recent_patches
// ============================================================

console.log("\n════ LIST: Recent Patches Feed ════");

// CREATE — push patches to front of list (newest first)
await client.lPush("recent_patches", "Valorant:8.06");
await client.lPush("recent_patches", "League of Legends:14.6");
await client.lPush("recent_patches", "Apex Legends:19.2");
await client.lPush("recent_patches", "Valorant:8.04");
await client.lPush("recent_patches", "League of Legends:14.5");
await client.lPush("recent_patches", "Apex Legends:19.1");
// cap at 10 entries
await client.lTrim("recent_patches", 0, 9);
console.log("CREATE — Recent patches feed populated and capped at 10");

// READ — get the full feed
const feed = await client.lRange("recent_patches", 0, -1);
console.log("\nREAD — Full recent patches feed (newest first):");
feed.forEach((p, i) => console.log(`  [${i}] ${p}`));

// READ — peek at most recent patch
const latest = await client.lIndex("recent_patches", 0);
console.log(`\nREAD — Most recent patch: ${latest}`);

// UPDATE — simulate a new patch dropping (push + trim)
await client.lPush("recent_patches", "Valorant:8.08");
await client.lTrim("recent_patches", 0, 9);
const afterUpdate = await client.lIndex("recent_patches", 0);
console.log(`UPDATE — New patch pushed. Latest is now: ${afterUpdate}`);

// DELETE — remove a specific patch from the feed
await client.lRem("recent_patches", 1, "Valorant:8.06");
const afterRemove = await client.lRange("recent_patches", 0, -1);
console.log(`DELETE — Removed Valorant:8.06. Feed: [${afterRemove.join(", ")}]`);

// DELETE — pop oldest patch off the end
const popped = await client.rPop("recent_patches");
console.log(`DELETE — Popped oldest patch: ${popped}`);

// ── DONE ─────────────────────────────────────────────────────
console.log("\n── All Redis operations complete ──");
await client.quit();
