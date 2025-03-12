"use server";

import { NextResponse } from "next/server";
import { getGPTS } from "@/libs/get-gpts";

export async function GET() {
  try {
    const allGPTS = await getGPTS();
    return NextResponse.json(allGPTS, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
