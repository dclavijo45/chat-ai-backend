import { Router } from "express";
import { OpenaiApiService } from "../services/openai-api.service";

const router = Router();

router.post("/chat/start", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const openaiApiService = new OpenaiApiService();

  const { history } = req.body;

  const result = await openaiApiService.start(history);

  for await (const chunk of result) {
    res.write(chunk.choices[0]?.delta?.content || "");
  }

  res.end();
});

router.post("/chat/conversation", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const openaiApiService = new OpenaiApiService();

  const { history } = req.body;

  const result = await openaiApiService.conversation(history);

  for await (const chunk of result) {
    res.write(chunk.choices[0]?.delta?.content || "");
  }

  res.end();
});

export default router;
