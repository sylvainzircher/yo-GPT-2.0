"use client";
import { useEffect, useState } from "react";
import { getImageGenUsageDaily } from "@/libs/get-imagegen-usage-by-day";
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function UsageTrend() {
  const [dailyTrend, setDailyTrend] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [totals, setTotals] = useState([]);

  useEffect(() => {
    const getDailyUsageData = async () => {
      const usageData = await getImageGenUsageDaily();
      if (usageData.length > 0) {
        setDailyTrend(usageData);
        setDataLoaded(true);
        const t = await getTheTotals(usageData);
        setTotals(t);
      }
    };
    getDailyUsageData();
  }, []);

  const getTheTotals = async (data) => {
    const totalSums = data.reduce(
      (acc, entry) => {
        acc.cost += entry.cost;
        return acc;
      },
      {
        cost: 0,
      }
    );
    return totalSums;
  };

  const formatterDollars = new Intl.NumberFormat("en-US", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

  return (
    <div className="w-full h-full">
      {!dataLoaded && (
        <div className="p-5 mx-auto">
          <p className="text-sm">No usage data yet ...</p>
        </div>
      )}
      {dataLoaded && (
        <div className="p-3 mx-auto">
          <div>
            {totals && (
              <div className="mt-3 mb-5 pb-5 flex flex-row border-b border-neutral-content">
                <div className="font-bold ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-200 rounded-xl justify-center">
                  <p className="mr-1">Total ($): </p>
                  <p>{formatterDollars.format(totals.cost)}</p>
                </div>
              </div>
            )}
            <div className="text-xs" style={{ width: "100%", height: 200 }}>
              <p className="text-sm">
                <span className="italic">(Last 10 days)</span>
              </p>
              <ResponsiveContainer>
                <AreaChart
                  data={dailyTrend}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => formatterDollars.format(value)}
                  />
                  <Tooltip
                    formatter={(value, name) => {
                      const labelMap = {
                        cost: "Cost ($)",
                      };
                      return [
                        formatterDollars.format(value),
                        labelMap[name] || name,
                      ];
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Cost in $"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
