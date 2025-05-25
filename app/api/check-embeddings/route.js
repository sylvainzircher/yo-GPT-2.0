import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const folderPath = path.join(process.cwd(), "embeddings");

  if (fs.existsSync(folderPath)) {
    return NextResponse.json({ exists: true });
  } else {
    return NextResponse.json({ exists: false });
  }
}
