"use server";
import { initializeDB } from "./create-db";

export async function getMessagesById(chatId) {
  try {
    const db = await initializeDB();
    await db.read();

    const chats = db.data.chats;

    return chats
      .filter((chat) => String(chat.id) === String(chatId))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map(({ role, content, reasoning }) => ({
        role,
        content,
        reasoning,
      }));
  } catch (error) {
    console.error("Error fetching messages by id:", error);
    return [];
  }
}
