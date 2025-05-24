import { z } from "zod";
import { tool } from "ai";

const performWebSearch = async (query) => {
  const res = await fetch(
    `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${
      process.env.NEXT_PUBLIC_SERP_API
    }`
  );
  if (!res.ok) {
    console.error("Failed to fetch from SerpAPI:", await res.text());
    return "⚠️ Error fetching search results.";
  }
  const data = await res.json();
  return (
    data.organic_results?.map((r) => `-${r.title}: ${r.snippet}`).join("\n") ||
    "No results found."
  );
};

export const searchWebTool = tool({
  description: "Performs a web search for the given query.",
  parameters: z.object({
    query: z.string().describe("The search query string."),
  }),
  execute: async ({ query }) => {
    const searchResult = await performWebSearch(query);
    console.log("Search: " + searchResult);
    return searchResult;
  },
});
