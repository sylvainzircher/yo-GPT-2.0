"use server";
import { initializeDB } from "./create-usagedb";
import { models } from "@/data/models";

export async function saveUsage({
  uid,
  type,
  promptTokens,
  completionTokens,
  nbTokens,
  modelName,
}) {
  const db = await initializeDB();
  await db.read();

  const model = models.find((item) => item.name === modelName);

  const usage = {
    id: uid,
    type: type,
    model: modelName,
    promptUsageInTokens: promptTokens,
    completionUsageInTokens: completionTokens,
    totalUsageInTokens: nbTokens,
    promptUsageInDollars: (model.priceSimplified * promptTokens) / 1000000,
    completionUsageInDollars:
      (model.priceSimplified * completionTokens) / 1000000,
    totalUsageInDollars: (model.priceSimplified * nbTokens) / 1000000,
    timestamp: new Date().toISOString(),
  };

  db.data.usage.push(usage);
  await db.write();
}
