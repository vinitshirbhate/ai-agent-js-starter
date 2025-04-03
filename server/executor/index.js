import express from "express";
import cors from "cors";

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors({ origin: "*" }));

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

app.post("/", async (req, res) => {
  const { code } = req.body;
  console.log(code);

  const result = await evalAndCaptureOutput(code);
  console.log(result);

  res.json(result);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
