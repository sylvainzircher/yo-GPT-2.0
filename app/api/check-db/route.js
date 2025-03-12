import { initializeDB } from "@/libs/create-db";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// NOT IN USE
// LOGIC INSIDE create-db.js
// When app is reloaded on fetching all the messages to display on the sidebar
// if the db.json file is deleted it will then be recreated
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "db.json");
    const dbExists = fs.existsSync(filePath);
    const db = await initializeDB();
    const isInitialized = db.data && db.data.chats !== undefined;

    return NextResponse.json({
      dbExists,
      isInitialized,
      chatCount: isInitialized ? db.data.chats.length : 0,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function POST() {
  const filePath = path.join(process.cwd(), "data", "db.json");
  if (!fs.existsSync(filePath)) {
    await initializeDB();
    return NextResponse.json(
      { message: "Database created successfully" },
      { status: 201 }
    );
  }
  return NextResponse.json(
    { message: "Database already exists" },
    { status: 200 }
  );
}
