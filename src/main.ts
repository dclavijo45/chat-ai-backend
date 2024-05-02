import { GeminiApiService } from "./services/gemini-api.service";
import { PORT } from "./config/server.config";
import cors from "cors";
import express from "express";
import http from "http";

const appExpress = express();
const server = http.createServer(appExpress);

appExpress.use(express.json());

const corsOptions = {
  origin: [
    "http://localhost:4200",
    "https://chat-ai.dclavijo45.dev",
  ],
};

appExpress.use(cors(corsOptions));

appExpress.post("/chat/start", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const geminiApiService = new GeminiApiService();

  const { prompt } = req.body;

  const result = await geminiApiService.start(prompt);

  for await (const chunk of result.stream) {
    res.write(chunk.text());
  }

  res.end();
});

appExpress.post("/chat/conversation", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const geminiApiService = new GeminiApiService();

  const { history, prompt } = req.body;

  const result = await geminiApiService.conversation(history, prompt);

  for await (const chunk of result.stream) {
    res.write(chunk.text());
  }

  res.end();
});

server.listen(PORT, () => {
  console.log(`Http server is running on port: ${PORT}`);
});
