"use server";
import { initializeDB } from "./create-db";

export async function replaceMessage({
  id,
  role,
  content,
  title,
  timestamp,
  reasoning,
}) {
  const db = await initializeDB();
  db.read();

  const assistantMessages = db.data.chats
    .filter((msg) => msg.id === id && msg.role === role)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // If stopping the first assistant response, the message will not be saved
  // Can only replace if there is one assistant message
  if (assistantMessages.length > 0) {
    const lastAssistantMessage = assistantMessages[0];
    lastAssistantMessage.content = content;
    lastAssistantMessage.reasoning = reasoning;
  } else {
    const message = {
      id: id,
      role: role,
      content: content,
      title: title,
      timestamp: timestamp,
      reasoning: reasoning,
    };
    db.data.chats.push(message);
  }
  await db.write();
}
