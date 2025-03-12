"use server";
import { initializeDB } from "./create-usagedb";

export async function getDailyUsage() {
  const db = await initializeDB();
  await db.read();

  const usageData = db.data.usage;

  // Get today's date and the cutoff date (7 days ago)
  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  const usageByDay = usageData.reduce((acc, entry) => {
    const date = entry.timestamp.split("T")[0]; // Extract YYYY-MM-DD
    const entryDate = new Date(date);
    // Only process entries from the last 7 days
    if (entryDate < tenDaysAgo) return acc;

    if (!acc[date]) {
      acc[date] = {
        promptUsageInTokens: 0,
        completionUsageInTokens: 0,
        totalUsageInTokens: 0,
        promptUsageInDollars: 0,
        completionUsageInDollars: 0,
        totalUsageInDollars: 0,
      };
    }

    acc[date].promptUsageInTokens += entry.promptUsageInTokens;
    acc[date].completionUsageInTokens += entry.completionUsageInTokens;
    acc[date].totalUsageInTokens += entry.totalUsageInTokens;
    acc[date].promptUsageInDollars += entry.promptUsageInDollars;
    acc[date].completionUsageInDollars += entry.completionUsageInDollars;
    acc[date].totalUsageInDollars += entry.totalUsageInDollars;

    return acc;
  }, {});

  const result = Object.entries(usageByDay).map(([date, usage]) => ({
    date,
    promptUsageInDollars: Number(usage.promptUsageInDollars.toFixed(6)),
    completionUsageInDollars: Number(usage.completionUsageInDollars.toFixed(6)),
    totalUsageInDollars: Number(usage.totalUsageInDollars.toFixed(6)),
    promptUsageInTokens: usage.promptUsageInTokens,
    completionUsageInTokens: usage.completionUsageInTokens,
    totalUsageInTokens: usage.totalUsageInTokens,
  }));

  return result;
}
