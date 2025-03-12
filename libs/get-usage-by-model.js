"use server";
import { initializeDB } from "./create-usagedb";

export async function getUsageByModel() {
  const db = await initializeDB();
  db.read();

  const usageData = db.data.usage;

  // Get today's date and the cutoff date (7 days ago)
  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  const usageByDayAndByModel = usageData.reduce((acc, entry) => {
    const date = entry.timestamp.split("T")[0]; // Extract YYYY-MM-DD
    const entryDate = new Date(date);
    // Only process entries from the last 7 days
    if (entryDate < tenDaysAgo) return acc;

    const model = entry.model;

    // Create a unique key for grouping
    const key = `${date}_${model}`;

    if (!acc[key]) {
      acc[key] = {
        date,
        model,
        promptUsageInTokens: 0,
        completionUsageInTokens: 0,
        totalUsageInTokens: 0,
        promptUsageInDollars: 0,
        completionUsageInDollars: 0,
        totalUsageInDollars: 0,
      };
    }

    acc[key].promptUsageInTokens += entry.promptUsageInTokens;
    acc[key].completionUsageInTokens += entry.completionUsageInTokens;
    acc[key].totalUsageInTokens += entry.totalUsageInTokens;
    acc[key].promptUsageInDollars += entry.promptUsageInDollars;
    acc[key].completionUsageInDollars += entry.completionUsageInDollars;
    acc[key].totalUsageInDollars += entry.totalUsageInDollars;

    return acc;
  }, {});

  const result = Object.values(usageByDayAndByModel).map((usage) => ({
    date: usage.date,
    model: usage.model,
    promptUsageInDollars: Number(usage.promptUsageInDollars.toFixed(6)),
    completionUsageInDollars: Number(usage.completionUsageInDollars.toFixed(6)),
    totalUsageInDollars: Number(usage.totalUsageInDollars.toFixed(6)),
    promptUsageInTokens: usage.promptUsageInTokens,
    completionUsageInTokens: usage.completionUsageInTokens,
    totalUsageInTokens: usage.totalUsageInTokens,
  }));

  return result;
}
