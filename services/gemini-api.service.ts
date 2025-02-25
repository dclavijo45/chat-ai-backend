import {
  Content,
  GenerateContentStreamResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { GEMINI_API_KEY, SAFETY_SETTINGS } from "../config/gemini-api.config";
import { IHistory, TypePartEnum } from "../models/message-ai.model";

export class GeminiApiService {
  constructor() {
    this.generateAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  private generateAI: GoogleGenerativeAI;

  async conversation(history: IHistory[]): Promise<GenerateContentStreamResult> {
    const model = this.generateAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      safetySettings: SAFETY_SETTINGS,
    });

    const contents: Content[] = [];

    for (const msg of history) {
      const content: Content = {
        role: msg.role,
        parts: [],
      };

      msg.parts.forEach((part) => {
        if (part.type == TypePartEnum.image) {
          const imageInfo = part.text.split(",");

          content.parts.push({
            inlineData: {
              data: imageInfo[1],
              mimeType: imageInfo[0].split(":")[1].split(";")[0],
            },
          });
        }

        if (part.type == TypePartEnum.text) {
          content.parts.push({
            text: part.text,
          });
        }
      });

      contents.push(content);
    }

    const result = await model.generateContentStream({
      contents,
    });

    return result;
  }
}
