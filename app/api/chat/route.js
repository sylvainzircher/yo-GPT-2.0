import { createOpenAI } from "@ai-sdk/openai";
import { streamText, extractReasoningMiddleware, wrapLanguageModel } from "ai";
import { models } from "@/data/models";
import { template as markdownInstruction } from "@/libs/template";
import { generateTitle } from "@/libs/generate-title";
import { saveMessage } from "@/libs/save-message";
import { saveUsage } from "@/libs/save-usage";
import { replaceMessage } from "@/libs/replace-message";
import { getMessagesById } from "@/libs/get-messages-by-id";

const fireworks = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_FIREWORKS_API_KEY ?? "",
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export async function POST(req) {
  // Check if API Key exists
  if (!process.env.NEXT_PUBLIC_FIREWORKS_API_KEY) {
    return Response.json(
      { error: "Missing Fireworks API key" },
      { status: 400 }
    );
  }

  const {
    messages,
    model,
    temperature,
    maxTokens,
    uid,
    autoTitle,
    autoSave,
    isReload,
    isEdited,
    gpt,
  } = await req.json();

  const convoId = uid.includes("gpt") ? uid : gpt ? gpt[0].id + "_" + uid : uid;

  // Save the assistant responses
  const saveAssistantMessage = async (text, reasoning) => {
    if (isReload || isEdited) {
      await replaceMessage({
        id: convoId,
        role: "assistant",
        content: text,
        title: "",
        timestamp: new Date().toISOString(),
        reasoning: reasoning ? reasoning : "",
      });
    } else {
      await saveMessage({
        id: convoId,
        role: "assistant",
        content: text,
        title: "",
        timestamp: new Date().toISOString(),
        reasoning: reasoning ? reasoning : "",
      });
    }
  };

  if (autoSave) {
    const retrievedMessages = await getMessagesById(convoId);
    const isUpToDate = messages.length - 1 === retrievedMessages.length; // retrievedMessages lagging behind by one message
    if (isUpToDate) {
      // Save the first question of the chat and add the title to it
      if (messages.length === 1) {
        const title = autoTitle
          ? await generateTitle(convoId, model, messages[0].content)
          : new Date().toISOString();
        await saveMessage({
          id: convoId,
          role: messages[0].role,
          content: messages[0].content,
          title: title,
          timestamp: new Date().toISOString(),
          reasoning: messages[0].reasoning ? messages[0].reasoning : "",
        });
        // Save the following users questions with no title unless there was a reload
      } else {
        // If it is not a user message coming from a reload or has been edited go ahead and save
        // When relaoded there is no need to save the message
        if (!isReload && !isEdited) {
          await saveMessage({
            id: convoId,
            role: messages[messages.length - 1].role,
            content: messages[messages.length - 1].content,
            title: "",
            timestamp: new Date().toISOString(),
            reasoning: messages[0].reasoning ? messages[0].reasoning : "",
          });
        }
        // If it was an edit we have to replace the original user message by the edited one
        if (isEdited) {
          await replaceMessage({
            id: convoId,
            role: "user",
            content: messages[messages.length - 1].content,
            title: "",
            timestamp: new Date().toISOString(),
            reasoning: messages[0].reasoning ? messages[0].reasoning : "",
          });
        }
      }
    } else {
      // If not up to date
      if (retrievedMessages.length < messages.length) {
        const messageDifferent = messages.length - retrievedMessages.length;
        // if there is no message saved the first one needs to have a title
        for (let i = 1; i <= messageDifferent; i++) {
          if (retrievedMessages.length === 0 && i === 1) {
            await saveMessage({
              id: convoId,
              role: messages[retrievedMessages.length - 1 + i].role,
              content: messages[retrievedMessages.length - 1 + i].content,
              title: autoTitle
                ? await generateTitle(convoId, model, messages[0].content)
                : new Date().toISOString(),
              timestamp: new Date().toISOString(),
              reasoning: messages[retrievedMessages.length - 1 + i].reasoning
                ? messages[retrievedMessages.length - 1 + i].reasoning
                : "",
            });
          } else {
            await saveMessage({
              id: convoId,
              role: messages[retrievedMessages.length - 1 + i].role,
              content: messages[retrievedMessages.length - 1 + i].content,
              title: "",
              timestamp: new Date().toISOString(),
              reasoning: messages[retrievedMessages.length - 1 + i].reasoning
                ? messages[retrievedMessages.length - 1 + i].reasoning
                : "",
            });
          }
        }
      }
    }
  }

  try {
    const model_ = gpt
      ? models.find((m) => m.name === gpt.model)
      : models.find((m) => m.name === model);
    const modelApi = model_
      ? model_.api
      : "accounts/fireworks/models/llama-v3p3-70b-instruct";

    const systemPrompt =
      (gpt
        ? `
  You are a specialized assistant. 

  - **Name**: ${gpt[0].name}
  - **Description**: ${gpt[0].description}

  ⚠️ **IMPORTANT INSTRUCTIONS:**  
  ${gpt[0].instructions}
  `
        : `
  You are a friendly assistant.  
  Be polite, clear, and as detailed as possible.
  `) +
      `📌 **Formatting Requirement:**  
  Please output your answer in **Markdown** format.  
  Feel free to add **titles, subtitles, and emojis** if necessary.
  ${markdownInstruction}`;

    const result = streamText({
      system: systemPrompt,
      model:
        modelApi === "accounts/fireworks/models/deepseek-r1"
          ? wrapLanguageModel({
              model: fireworks(modelApi),
              middleware: extractReasoningMiddleware({ tagName: "think" }),
            })
          : fireworks(modelApi),
      messages,
      temperature: temperature / 100 || 0.7,
      maxTokens: Number(maxTokens) || 1200,
      async onFinish({ text, reasoning, usage, response }) {
        await saveUsage({
          uid: convoId,
          type: "Chat",
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          nbTokens: usage.totalTokens,
          modelName: model,
        });
        if (autoSave) {
          await saveAssistantMessage(text, reasoning);
        }
      },
    });

    return modelApi === "accounts/fireworks/models/deepseek-r1"
      ? result.toDataStreamResponse({
          sendReasoning: true,
        })
      : result.toDataStreamResponse();
  } catch (error) {
    return Response.json(
      { error: "Internal Server Error trying generating an answer" },
      { status: 500 }
    );
  }
}
