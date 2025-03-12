"use server";
import { initializeDB } from "./create-usagedb";

export async function getUsageById(uid) {
  const db = await initializeDB();
  db.read();

  const usageData = db.data.usage;
  const usageDataId = usageData.filter((entry) => entry.id === uid);

  const totalsInToken = usageDataId.reduce(
    (acc, entry) => {
      acc.promptTokens += entry.promptUsageInTokens;
      acc.completionTokens += entry.completionUsageInTokens;
      acc.totalTokens += entry.totalUsageInTokens;
      return acc;
    },
    { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
  );

  const totalsInDollards = usageDataId.reduce(
    (acc, entry) => {
      acc.promptTokensAmount += entry.promptUsageInDollars;
      acc.completionTokensAmount += entry.completionUsageInDollars;
      acc.totalTokensAmount += entry.totalUsageInDollars;
      return acc;
    },
    { promptTokensAmount: 0, completionTokensAmount: 0, totalTokensAmount: 0 }
  );

  return [totalsInToken, totalsInDollards];
}
