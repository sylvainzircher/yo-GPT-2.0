"use server";
import { initializeDB } from "./create-gptdb";

export async function getGPTById(gptId) {
  const db = await initializeDB();
  db.read();

  const gpts = db.data.gpt;

  return gpts.filter((gpt) => String(gpt.id) === String(gptId));
}
