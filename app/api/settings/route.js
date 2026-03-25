import fs from "fs/promises";
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
    let data;
    try {
      data = await fs.readFile(filePath, "utf-8");
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultSettings, null, 2));
      console.log("Created settings.json with default values.");
      data = JSON.stringify(defaultSettings);
    }
    const settings = JSON.parse(data);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error accessing settings:", error);
    return NextResponse.json({ error: "Failed to read settings" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { type, value } = await req.json();
    const data = await fs.readFile(filePath, "utf-8");
    const currentSettings = JSON.parse(data);

    if (type === "model") currentSettings.model = value;
    if (type === "temperature") currentSettings.temperature = value;
    if (type === "maxTokens") currentSettings.maxTokens = value;
    if (type === "autoSave") currentSettings.autoSave = value;
    if (type === "autoTitle") currentSettings.autoTitle = value;

    await fs.writeFile(filePath, JSON.stringify(currentSettings, null, 2));

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
