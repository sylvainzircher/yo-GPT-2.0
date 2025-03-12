"use server";

import { NextResponse } from "next/server";
import { getMessages } from "@/libs/get-messages";

export async function GET() {
  try {
    const allChats = await getMessages();
    return NextResponse.json(allChats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
