"use server";
import { initializeDB } from "./create-db";

export async function renameChat(id, newTitle) {
  try {
    const db = await initializeDB();
    db.read();

    const chats = db.data.chats;
    const chatToUpdate = chats.find(
      (chat) => chat.id === id && chat.title !== ""
    );

    if (chatToUpdate) {
      chatToUpdate.title = newTitle;
      db.write();
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error renaming chat:", error);
    return false;
  }
}
