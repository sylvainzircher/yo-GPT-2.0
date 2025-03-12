"use server";
import { initializeDB } from "./create-db";

export async function getMessagesById(chatId) {
  const db = await initializeDB();
  db.read();

  const chats = db.data.chats;

  return chats
    .filter((chat) => String(chat.id) === String(chatId))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(({ role, content, reasoning }) => ({
      role,
      content,
      reasoning,
    }));
}
