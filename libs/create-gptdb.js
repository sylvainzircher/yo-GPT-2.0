"use server";
import fs from "fs";
import path from "path";
import { JSONFilePreset } from "lowdb/node";

const filePath = path.join(process.cwd(), "data", "gpt.json");

export async function initializeDB() {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ gpt: [] }, null, 2), "utf8");
  }

  const db = await JSONFilePreset(filePath, { gpt: [] });

  return db;
}
