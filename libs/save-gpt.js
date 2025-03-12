"use server";
import { initializeDB } from "./create-gptdb";

export async function saveGPT({
  id,
  model,
  name,
  description,
  instructions,
  timestamp,
}) {
  const db = await initializeDB();
  await db.read();
  const gpt = {
    id: id,
    model: model,
    name: name,
    description: description,
    instructions: instructions,
    timestamp: timestamp,
  };
  db.data.gpt.push(gpt);
  await db.write();
}
