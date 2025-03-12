"use server";
import { initializeDB } from "./create-db";
import { getMessagesById } from "./get-messages-by-id";
import { generateTitle } from "@/libs/generate-title";

export async function saveMessageManually({
  uid,
  messages,
  model,
  autoTitle,
  gpt,
}) {
  const tmp = new Date().toISOString();
  const convoId = uid.includes("gpt") ? uid : gpt ? gpt[0].id + "_" + uid : uid;
  const retrievedMessages = await getMessagesById(convoId);
  let title;

  const db = await initializeDB();
  db.read();

  if (retrievedMessages.length === 0) {
    // If no messages were retrieved for the convoId then generate a title otherwise no need & save all the messages
    if (autoTitle) {
      title = await generateTitle(convoId, model, messages[0].content);
    } else {
      title = tmp;
    }
    messages.forEach((message, index) => {
      const m = {
        id: convoId,
        role: message.role,
        content: message.content,
        title: index === 0 ? title : "",
        timestamp: tmp,
        reasoning: message.reasoning ? message.reasoning : "",
      };
      db.data.chats.push(m);
      db.write();
    });
    // If the retrieved messages list is incomplete save the additional messages
  } else if (retrievedMessages.length < messages.length) {
    const messageDifferent = messages.length - retrievedMessages.length;
    for (let i = 1; i <= messageDifferent; i++) {
      const m = {
        id: convoId,
        role: messages[retrievedMessages.length - 1 + i].role,
        content: messages[retrievedMessages.length - 1 + i].content,
        title: "",
        timestamp: tmp,
        reasoning: messages[retrievedMessages.length - 1 + i].reasoning
          ? messages[retrievedMessages.length - 1 + i].reasoning
          : "",
      };
      db.data.chats.push(m);
      db.write();
    }
  } else {
    return;
  }
}
