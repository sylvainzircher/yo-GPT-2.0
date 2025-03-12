"use server";
import { initializeDB } from "./create-gptdb";

export async function updateGPT({
  id,
  model,
  name,
  description,
  instructions,
}) {
  const db = await initializeDB();
  await db.read();

  // Find the GPT entry by id
  const gptIndex = db.data.gpt.findIndex((gpt) => gpt.id === id);

  // Update the existing GPT
  db.data.gpt[gptIndex] = {
    ...db.data.gpt[gptIndex],
    model,
    name,
    description,
    instructions,
  };

  await db.write();
}
