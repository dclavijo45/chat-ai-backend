import { Router } from "express";
import { AnthropicApiService } from "../services/anthropic-api.service";

const router = Router();

router.post("/chat/start", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const anthropicApiService = new AnthropicApiService();

  const { history } = req.body;

  const result = await anthropicApiService.start(history);

  result.on("text", (text) => res.write(text));

  await result.done();

  res.end();
});

router.post("/chat/conversation", async (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const anthropicApiService = new AnthropicApiService();

  const { history } = req.body;

  const result = await anthropicApiService.conversation(history);

  result.on("text", (text) => res.write(text));

  await result.done();

  res.end();
});

export default router;
