"use server";
import { initializeDB } from "./create-db";

export async function deleteChatsById(id) {
  try {
    const db = await initializeDB();
    db.read();

    const chats = db.data.chats;

    // Filter out chats with the matching id
    db.data.chats = chats.filter((chat) => chat.id !== id);

    db.write();
    return true;
  } catch (error) {
    console.error("Error deleting chats:", error);
    return false;
  }
}
