"use server";
import { initializeDB } from "./create-gptdb";

// Returns list of id and titles
export async function getGPTS() {
  const db = await initializeDB();
  await db.read();

  const gpts = db.data.gpt;
  const seen = new Set();

  return gpts
    .filter(({ id, name }) => {
      if (!name) return false;
      const key = `${id}-${name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}
