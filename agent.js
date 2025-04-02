import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

const weatherTool = tool(
  async ({ query }) => {
    console.log("query", query);

    return `The weather in Tokyo is sunny.`;
  },
  {
    name: "weather",
    description: "get the weather in a given location",
    schema: z.object({
      query: z.string().describe("the query to use in search"),
    }),
  }
);
async function evalAndCaptureOutput(code) {
  const oldLog = console.log;
  const oldError = console.error;

  const output = [];
  let errorOutput = [];

  console.log = (...args) => output.push(args.join(" "));
  console.error = (...args) => errorOutput.push(args.join(" "));

  try {
    await eval(code);
  } catch (error) {
    errorOutput.push(error.message);
  }

  console.log = oldLog;
  console.error = oldError;

  return { stdout: output.join("\n"), stderr: errorOutput.join("\n") };
}

const jsExecuter = tool(
  async ({ code }) => {
    console.log("I should run this code: ", code);

    console.log("-----------------------");
    const result = await evalAndCaptureOutput(code);
    console.log("-----------------------");
    console.log("result: ", result);

    return result;
  },
  {
    name: "run_js_code_tool",
    description: `
    Run general purpose javascript code.
    This can be used to access the internet or to do computations as you need.
    the output should be composed of stdout and stderr.
    The code should be written in a way that it can be executed with javascript eval in node enviroment.
    `,
    schema: z.object({
      code: z.string().describe("the code to run"),
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
  tools: [weatherTool, jsExecuter],
  checkpointSaver,
});
