"use server";
import fs from "fs";
import path from "path";
import { JSONFilePreset } from "lowdb/node";

const filePath = path.join(process.cwd(), "data", "db.json");

export async function initializeDB() {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // Create "data" folder if missing
  }

  // Check if db.json exists, if not create it
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ chats: [] }, null, 2), "utf8");
  }

  const db = await JSONFilePreset(filePath, { chats: [] });

  return db; // Return the initialized database instance
}
