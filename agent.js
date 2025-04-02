import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

const weatherTool = tool(
  async ({ query }) => {
    console.log("query", query);

    return { message: `The weather in Tokyo is sunny.` };
  },
  {
    name: "weather",
    description: "get the weather in a given location",
    schema: z.object({
      query: z.string().describe("the query to use in search"),
    }),
  }
);

const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});
