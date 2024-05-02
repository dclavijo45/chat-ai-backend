import {
  Content,
  GenerateContentStreamResult,
  GoogleGenerativeAI
} from "@google/generative-ai";
import { GEMINI_API_KEY, SAFETY_SETTINGS } from "../config/gemini-api.config";

export class GeminiApiService {
  constructor() {
    this.generateAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  private generateAI: GoogleGenerativeAI;

  async start(userPrompt: string): Promise<GenerateContentStreamResult> {
    const model = this.generateAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: SAFETY_SETTINGS,
    });

    const result = await model.generateContentStream(userPrompt);

    return result;
  }

  async conversation(
    history: Content[],
    userPrompt: string
  ): Promise<GenerateContentStreamResult> {
    const model = this.generateAI.getGenerativeModel({
      model: "gemini-pro",
      safetySettings: SAFETY_SETTINGS,
    });

    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessageStream(userPrompt);

    return result;
  }
}
