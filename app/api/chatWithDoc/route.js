import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const fireworks = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  // check if user has sent a PDF
  const messagesHavePDF = messages.some((message) =>
    message.experimental_attachments?.some(
      (a) => a.contentType === "application/pdf"
    )
  );

  const result = streamText({
    model: fireworks("accounts/fireworks/models/llama-v3p3-70b-instruct"),
    messages,
  });

  return result.toDataStreamResponse();
}
