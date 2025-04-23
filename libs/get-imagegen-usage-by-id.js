"use server";
import { initializeDB } from "./create-usage-imagegendb";

export async function getImageGenUsageById(uid) {
  const db = await initializeDB();
  db.read();

  const usageData = db.data.usage;
  const usageDataId = usageData.filter((entry) => entry.id === uid);

  const totalCost = usageDataId.reduce(
    (acc, entry) => {
      acc.cost += entry.cost;
      return acc;
    },
    { cost: 0 }
  );

  return totalCost;
}
