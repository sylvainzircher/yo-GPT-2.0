"use server";

import { NextResponse } from "next/server";
import { getGPTById } from "@/libs/get-gpt-by-id";

export async function GET(req, { params }) {
  const { gptId } = await params;
  try {
    const gpt = await getGPTById(gptId);
    return NextResponse.json(gpt, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch the custom GPT" },
      { status: 500 }
    );
  }
}
