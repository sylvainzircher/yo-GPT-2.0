"use server";
import { initializeDB } from "./create-usagedb";

const getThirtyDaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  console.log(date.toISOString().split("T")[0]);
  return date.toISOString().split("T")[0]; // Extract YYYY-MM-DD
};

export async function deleteOldUsage() {
  try {
    const db = await initializeDB();
    await db.read();

    // Filter out old chats
    const thirtyDaysAgo = getThirtyDaysAgo();
    db.data.usage = db.data.usage.filter((entry) => {
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
