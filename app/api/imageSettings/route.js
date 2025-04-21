import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "public/imageSettings.json");

const defaultSettings = {
  imageStrength: "20",
  cfgScale: "7",
};

export async function GET() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultSettings, null, 2));
      console.log("Created settings.json with default values.");
    }

    const data = fs.readFileSync(filePath, "utf-8");
    const settings = JSON.parse(data);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error accessing settings:", error);
  }
}

export async function POST(req) {
  try {
    const { type, value } = await req.json();
    const currentSettings = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (type === "imageStrength") {
      currentSettings.imageStrength = value;
    }

    if (type === "cfgScale") {
      currentSettings.cfgScale = value;
    }

    fs.writeFileSync(filePath, JSON.stringify(currentSettings, null, 2));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
