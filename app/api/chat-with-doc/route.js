import { streamText, extractReasoningMiddleware, wrapLanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import pdfParse from "pdf-parse";
import { models } from "@/data/models";
import { saveUsage } from "@/libs/save-usage";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { FastTextEmbeddings } from "@/libs/fasttext-embeddings";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const fireworks = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export const maxDuration = 30;

export async function POST(req) {
  const { messages, model, uid } = await req.json();
  const cleanedMessages = messages
    .map(({ role, content }) => {
      if (role !== "System") {
        return {
          // removes the experimental attachment otherwise streamText will not work
          role,
          content,
        };
      }
    })
    .filter(Boolean); // removes undefined entries
  let docs;

  for (const message of messages) {
    let attachment = message.experimental_attachments?.[0];

    if (attachment?.contentType === "application/pdf") {
      // Remove the "data:application/pdf;base64," prefix
      const base64Data = attachment.url.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");

      const data = await pdfParse(buffer);
      docs = [
        {
          pageContent: data.text,
          metadata: { source: attachment.name },
        },
      ];
    }
  }

  // Create a vector store
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splits = await textSplitter.splitDocuments(docs);

  const vectorstore = await MemoryVectorStore.fromDocuments(
    splits,
    new FastTextEmbeddings()
  );

  // Only extract from top document
  const retriever = vectorstore.asRetriever({ k: 10 });

  // Retrieve the chunks from the latest user question
  const latestUserMessage = messages
    .slice()
    .reverse() // look from end
    .find((msg) => msg.role === "user"); // find first user message

  const results = await retriever.invoke(latestUserMessage.content);

  // Push the chunks to the messages
  cleanedMessages.unshift({
    role: "system",
    content: `Context:\n${results
      .map((result) => result.pageContent)
      .join("\n\n")}`,
  });

  cleanedMessages.unshift({
    role: "system",
    content: `Use the following pieces of retrieved context to answer the question. If you don't know the answer, say that you don't know. PLEASE OUTPUT THE RESULT IN A MARKDOWN FORMAT.`,
  });

  const model_ = models.find((m) => m.name === model);
  const modelApi = model_
    ? model_.api
    : "accounts/fireworks/models/llama-v3p3-70b-instruct";

  const stream = streamText({
    model:
      modelApi === "accounts/fireworks/models/deepseek-r1"
        ? wrapLanguageModel({
            model: fireworks(modelApi),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          })
        : fireworks(modelApi),
    messages: cleanedMessages,
    async onFinish({ usage }) {
      await saveUsage({
        uid: crypto.randomUUID(),
        type: "Chat",
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        nbTokens: usage.totalTokens,
        modelName: model,
      });
    },
  });

  return stream.toDataStreamResponse();
}
