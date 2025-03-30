"use client";
import { useEffect, useState } from "react";
import { getDailyUsage } from "@/libs/get-daily-usage";
import { getUsageByModel } from "@/libs/get-usage-by-model";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function UsageTrend() {
  const [toggleAmount, setToggleAmount] = useState(false);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [totals, setTotals] = useState([]);
  const [dailyTrendByModel, setDailyTrendByModel] = useState([]);

  useEffect(() => {
    const getDailyUsageData = async () => {
      const usageData = await getDailyUsage();
      const usageByModel = await getUsageByModel();
      const usageByModel_t = transformDatabyDayAndModel(usageByModel);
      if (usageData.length > 0) {
        setDailyTrend(usageData);
        setDailyTrendByModel(usageByModel_t);
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
        acc.promptUsageInDollars += entry.promptUsageInDollars;
        acc.completionUsageInDollars += entry.completionUsageInDollars;
        acc.totalUsageInDollars += entry.totalUsageInDollars;
        acc.promptUsageInTokens += entry.promptUsageInTokens;
        acc.completionUsageInTokens += entry.completionUsageInTokens;
        acc.totalUsageInTokens += entry.totalUsageInTokens;

        return acc;
      },
      {
        promptUsageInDollars: 0,
        completionUsageInDollars: 0,
        totalUsageInDollars: 0,
        promptUsageInTokens: 0,
        completionUsageInTokens: 0,
        totalUsageInTokens: 0,
      }
    );
    return totalSums;
  };

  const formatterToken = new Intl.NumberFormat("en-US", {
    style: "decimal",
    useGrouping: true,
  });

  const formatterDollars = new Intl.NumberFormat("en-US", {
    style: "decimal",
    useGrouping: true,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

  const transformDatabyDayAndModel = (data) => {
    const tokensGrouped = {};
    const usageGrouped = {};

    data.forEach(
      ({ date, model, promptUsageInTokens, promptUsageInDollars }) => {
        if (!tokensGrouped[date]) {
          tokensGrouped[date] = { date };
        }
        if (!usageGrouped[date]) {
          usageGrouped[date] = { date };
        }

        tokensGrouped[date][model] = promptUsageInTokens;
        usageGrouped[date][model] = promptUsageInDollars;
      }
    );

    return [
      { tokens: Object.values(tokensGrouped) },
      { usage: Object.values(usageGrouped) },
    ];
  };

  return (
    <div>
      {!dataLoaded && (
        <div className="p-5 mx-auto">
          <p className="text-sm">No usage data yet ...</p>
        </div>
      )}
      {dataLoaded && (
        <div className="p-3 mx-auto w-full h-full">
          <div className="w-full border-b mb-5 pb-5">
            <div className="form-control w-32 text-sm pb-2">
              <label className="label cursor-pointer">
                <span
                  className={
                    !toggleAmount
                      ? "label-text"
                      : "label-text text-primary font-bold"
                  }
                >
                  Tokens
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-sm border-primary text-primary checked-border-primary checked-text-primary"
                  defaultChecked
                  onChange={() => setToggleAmount(!toggleAmount)}
                />
                <span
                  className={
                    !toggleAmount
                      ? "label-text text-primary font-bold"
                      : "label-text"
                  }
                >
                  $
                </span>
              </label>
            </div>
            <p className="text-lg font-bold mt-3">
              {toggleAmount ? "Usage in tokens" : "Usage in $"}
            </p>
          </div>
          {toggleAmount ? (
            <div>
              {totals && (
                <div className="mt-3 mb-5 pb-5 flex flex-row border-b">
                  <div className="font-bold ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-200 rounded-xl justify-center">
                    <p className="mr-1">Total: </p>
                    <p>{formatterToken.format(totals.totalUsageInTokens)}</p>
                  </div>
                  <div className="ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-100 rounded-xl justify-center">
                    <p className="mr-1">User: </p>
                    <p>{formatterToken.format(totals.promptUsageInTokens)}</p>
                  </div>
                  <div className="ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-100 rounded-xl justify-center">
                    <p className="mr-1">AI: </p>
                    <p>
                      {formatterToken.format(totals.completionUsageInTokens)}
                    </p>
                  </div>
                </div>
              )}
              <div className="text-xs" style={{ width: "100%", height: 240 }}>
                <p className="text-sm">
                  Broken down by token type{" "}
                  <span className="italic">(Last 10 days)</span>
                </p>
                <ResponsiveContainer>
                  <BarChart
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
                      tickFormatter={(value) => formatterToken.format(value)}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const labelMap = {
                          promptUsageInTokens: "Users Tokens (prompt)",
                          completionUsageInTokens: "Assistant Tokens (usage)",
                        };
                        return [
                          formatterToken.format(value),
                          labelMap[name] || name,
                        ];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="promptUsageInTokens"
                      stackId="a"
                      fill="#8884d8"
                      name="Users Tokens (prompt)"
                    />
                    <Bar
                      dataKey="completionUsageInTokens"
                      stackId="a"
                      fill="#82ca9d"
                      name="Assistant Tokens (usage)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className="text-xs mt-10"
                style={{ width: "100%", height: 240 }}
              >
                <p className="text-sm">
                  Broken down by model{" "}
                  <span className="italic">(Last 10 days)</span>
                </p>
                <ResponsiveContainer>
                  <BarChart
                    data={dailyTrendByModel[0].tokens}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) => formatterToken.format(value)}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        return [formatterToken.format(value), name];
                      }}
                    />
                    <Legend />
                    <Bar
                      type="monotone"
                      dataKey="deepseek-r1"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Bar
                      type="monotone"
                      dataKey="Llama-3.3-405B"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                    <Bar
                      type="monotone"
                      dataKey="mixtral-8x22b"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                    />
                    <Bar
                      type="monotone"
                      dataKey="Llama-3.3-70B"
                      stackId="1"
                      stroke="#FF8042"
                      fill="#FF8042"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div>
              {totals && (
                <div className="mt-3 mb-5 pb-5 flex flex-row border-b">
                  <div className="font-bold ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-200 rounded-xl justify-center">
                    <p className="mr-1">Total: </p>
                    <p>
                      {formatterDollars.format(totals.totalUsageInDollars)} $
                    </p>
                  </div>
                  <div className="ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-100 rounded-xl justify-center">
                    <p className="mr-1">User: </p>
                    <p>
                      {formatterDollars.format(totals.promptUsageInDollars)} $
                    </p>
                  </div>
                  <div className="ml-4 flex flex-row items-center w-40 p-5 text-sm border bg-base-100 rounded-xl justify-center">
                    <p className="mr-1">AI: </p>
                    <p>
                      {formatterDollars.format(totals.completionUsageInDollars)}
                      $
                    </p>
                  </div>
                </div>
              )}
              <div className="text-xs" style={{ width: "100%", height: 240 }}>
                <p className="text-sm">
                  Broken down by token type{" "}
                  <span className="italic">(Last 10 days)</span>
                </p>
                <ResponsiveContainer>
                  <BarChart
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
                      tickFormatter={(value) =>
                        formatterDollars.format(value) + "$"
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const labelMap = {
                          promptUsageInDollars: "Prompt $ Usage",
                          completionUsageInDollars: "Assistant $ Usage",
                        };
                        return [
                          formatterDollars.format(value) + "$",
                          labelMap[name] || name,
                        ];
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="promptUsageInDollars"
                      stackId="a"
                      fill="#8884d8"
                      name="Users Tokens (prompt)"
                    />
                    <Bar
                      dataKey="completionUsageInDollars"
                      stackId="a"
                      fill="#82ca9d"
                      name="Assistant Tokens (usage)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div
                className="text-xs mt-10"
                style={{ width: "100%", height: 240 }}
              >
                <p className="text-sm">
                  Broken down by model{" "}
                  <span className="italic">(Last 10 days)</span>
                </p>
                <ResponsiveContainer>
                  <BarChart
                    data={dailyTrendByModel[1].usage}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        formatterDollars.format(value) + "$"
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        return [formatterDollars.format(value) + "$", name];
                      }}
                    />
                    <Legend />
                    <Bar
                      type="monotone"
                      dataKey="deepseek-r1"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                    <Bar
                      type="monotone"
                      dataKey="Llama-3.3-405B"
                      stackId="1"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                    />
                    <Bar
                      type="monotone"
                      dataKey="mixtral-8x22b"
                      stackId="1"
                      stroke="#ffc658"
                      fill="#ffc658"
                    />
                    <Bar
                      type="monotone"
                      dataKey="Llama-3.3-70B"
                      stackId="1"
                      stroke="#FF8042"
                      fill="#FF8042"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
