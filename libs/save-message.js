"use server";
import { initializeDB } from "./create-db";

export async function saveMessage({
  id,
  role,
  content,
  title,
  timestamp,
  reasoning,
}) {
  const db = await initializeDB();
  await db.read();
  const message = {
    id: id,
    role: role,
    content: content,
    title: title,
    timestamp: timestamp,
    reasoning: reasoning,
  };
  db.data.chats.push(message);
  await db.write();
}
