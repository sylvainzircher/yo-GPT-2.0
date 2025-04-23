"use server";
import { initializeDB } from "./create-usage-imagegendb";

export async function getImageGenUsageDaily() {
  const db = await initializeDB();
  db.read();

  const usageData = db.data.usage;

  // Get today's date and the cutoff date (10 days ago)
  const today = new Date();
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(today.getDate() - 10);

  const usageByDay = usageData.reduce((acc, entry) => {
    const date = entry.timestamp.split("T")[0]; // Extract YYYY-MM-DD
    const entryDate = new Date(date);
    // Only process entries from the last 10 days
    if (entryDate < tenDaysAgo) return acc;

    if (!acc[date]) {
      acc[date] = {
        steps: 0,
        cost: 0,
      };
    }

    acc[date].steps += entry.steps;
    acc[date].cost += entry.cost;

    return acc;
  }, {});

  const result = Object.entries(usageByDay).map(([date, usage]) => ({
    date,
    steps: Number(usage.steps.toFixed(6)),
    cost: Number(usage.cost.toFixed(6)),
  }));

  return result;
}
