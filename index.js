import express from "express";
import cors from "cors";
import { agent } from "./agent.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate", async (req, res) => {
  try {
    const result = await agent.invoke(
      {
        messages: [
          {
            role: "user",
            content: "What's the weather in Tokyo?",
          },
        ],
      },
      {
        configurable: {
          thread_id: "42",
        },
      }
    );
    res.json(result.messages.at(-1)?.content);
  } catch (error) {
    console.error("Agent invocation error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
