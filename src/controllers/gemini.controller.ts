import { Router } from "express";
import { GeminiApiService } from "../services/gemini-api.service";

const router = Router();

router.post("/chat/start", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const geminiApiService = new GeminiApiService();

  const { history } = req.body;

  const result = await geminiApiService.start(history);

  for await (const chunk of result.stream) {
    res.write(chunk.text());
  }

  res.end();
});

router.post("/chat/conversation", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const geminiApiService = new GeminiApiService();

  const { history } = req.body;

  const result = await geminiApiService.conversation(history);

  for await (const chunk of result.stream) {
    res.write(chunk.text());
  }

  res.end();
});

export default router;
