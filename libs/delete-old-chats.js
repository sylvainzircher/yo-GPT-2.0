"use server";
import { initializeDB } from "./create-db";

const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
};

export async function deleteOldChats() {
  try {
    const db = await initializeDB();
    await db.read();

    // Filter out old chats
    const thirtyDaysAgo = getThirtyDaysAgo();
    db.data.chats = db.data.chats.filter((entry) => {
      const entryDate = entry.timestamp.split("T")[0]; // Extract YYYY-MM-DD
      return entryDate >= thirtyDaysAgo; // Keep only recent records
    });

    await db.write();
    return true;
  } catch (error) {
    console.error("Error deleting chats:", error);
    return false;
  }
}
