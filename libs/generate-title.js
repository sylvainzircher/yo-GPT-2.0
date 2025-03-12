import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { saveUsage } from "./save-usage";

const fireworks = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export async function generateTitle(uid, model, message) {
  try {
    const { text } = await generateText({
      model: fireworks("accounts/fireworks/models/llama-v3p3-70b-instruct"),
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
      prompt: message,
      async onStepFinish({ text, finishReason, usage, response }) {
        await saveUsage({
          uid: uid,
          type: "Title",
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          nbTokens: usage.totalTokens,
          modelName: model,
        });
      },
    });
    return text;
  } catch (error) {
    console.error("Error in API request generating the title:", error);
    return Response.json(
      { error: "Internal Server Error trying generating the title" },
      { status: 500 }
    );
  }
}
