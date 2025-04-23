"use server";
import { initializeDB } from "./create-usage-imagegendb";

export async function saveImageGenUsage({ uid, steps, cost }) {
  const db = await initializeDB();
  await db.read();

  const usage = {
    id: uid,
    steps: steps,
    cost: cost,
    timestamp: new Date().toISOString(),
  };

  db.data.usage.push(usage);
  await db.write();
}
