import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const filePath = path.join(process.cwd(), "public/settings.json");

const defaultSettings = {
  model: "Llama-3.3-70B",
  temperature: 70,
  maxTokens: 50000,
  autoSave: true,
  autoTitle: true,
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

    if (type === "model") {
      currentSettings.model = value;
    }

    if (type === "temperature") {
      currentSettings.temperature = value;
    }

    if (type === "maxTokens") {
      currentSettings.maxTokens = value;
    }

    if (type === "autoSave") {
      currentSettings.autoSave = value;
    }

    if (type === "autoTitle") {
      currentSettings.autoTitle = value;
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
