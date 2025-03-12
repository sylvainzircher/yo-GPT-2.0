"use server";
import { initializeDB } from "./create-gptdb";
import { initializeDB as initializeChatsDB } from "./create-db";
import { initializeDB as initializeUsageDB } from "./create-usagedb";

export async function deleteGPTById(id) {
  try {
    // Delete the custom GPT
    const db = await initializeDB();
    await db.read();
    const gpts = db.data.gpt;
    // Filter out gpt with the matching id
    db.data.gpt = gpts.filter((gpt) => gpt.id !== id);
    await db.write();

    // Update chat ids to remove the GPT ref
    const chatsDb = await initializeChatsDB();
    await chatsDb.read();
    const chats = chatsDb.data.chats;
    chatsDb.data.chats = chats.map((entry) => {
      if (entry.id.includes(id)) {
        return {
          ...entry,
          id: entry.id.replace(id, "").replace(/^_/, ""),
        };
      }
      return entry;
    });
    await chatsDb.write();

    // Update usage ids to remove the GPT ref
    const usageDb = await initializeUsageDB();
    await usageDb.read();
    const usageData = usageDb.data.usage;
    usageDb.data.usage = usageData.map((entry) => {
      if (entry.id.includes(id)) {
        return {
          ...entry,
          id: entry.id.replace(id, "").replace(/^_/, ""),
        };
      }
      return entry;
    });
    await usageDb.write();

    return true;
  } catch (error) {
    console.error("Error deleting gpt:", error);
    return false;
  }
}
