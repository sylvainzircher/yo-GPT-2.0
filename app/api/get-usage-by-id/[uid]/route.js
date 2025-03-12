"use server";

import { NextResponse } from "next/server";
import { getUsageById } from "@/libs/get-usage-by-id";

export async function GET(req, { params }) {
  const { uid } = await params;
  try {
    const usage = await getUsageById(uid);
    return NextResponse.json(usage, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}
