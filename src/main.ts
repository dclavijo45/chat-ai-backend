import cors from "cors";
import express from "express";
import http from "http";
import { PORT } from "./config/server.config";

import geminiController from "./controllers/gemini.controller";
import openaiController from "./controllers/openai.controller";

const appExpress = express();
const server = http.createServer(appExpress);

appExpress.use(express.json({ limit: "20mb" }));

const corsOptions = {
  origin: ["http://localhost:4200", "https://chat-ai.dclavijo45.dev"],
};

appExpress.use(cors(corsOptions));

appExpress.use("/gemini", geminiController);

appExpress.use("/openai", openaiController);

server.listen(PORT, () => {
  console.log(`Http server is running on port: ${PORT}`);
});
