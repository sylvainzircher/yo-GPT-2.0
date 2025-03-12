"use server";
import { initializeDB } from "./create-db";
import { deleteOldChats } from "./delete-old-chats";
import { deleteOldUsage } from "./delete-old-usage";

// Returns list of id and titles
export async function getMessages() {
  // Keep database small enough by ensuring that data older than 30 days is deleted
  // getMessages is called on the sidebar to update the list of chats on the side
  await deleteOldChats();
  await deleteOldUsage();
  //////////////////////////////////////////////////////////////////////////////////
  const db = await initializeDB();
  await db.read();

  const chats = db.data.chats;
  const seen = new Set();

  return chats
    .filter(({ id, title }) => {
      if (!title) return false;
      const key = `${id}-${title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map(({ id, title, timestamp }) => ({ id, title, timestamp }));
}
