import {
  Content,
  GenerateContentResponse,
  GoogleGenAI
} from "@google/genai";
import { GEMINI_API_KEY, SAFETY_SETTINGS } from "../config/gemini-api.config";
import { IHistory, TypePartEnum } from "../models/message-ai.model";

export class GeminiApiService {
  constructor() {
    this.generateAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
  }

  private generateAI: GoogleGenAI;

  async conversation(history: IHistory[]): Promise<AsyncGenerator<GenerateContentResponse, any, any>> {
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

    const response = this.generateAI.models.generateContentStream({
        model: 'gemini-2.5-flash-preview-05-20',
        contents,
        config: {
            safetySettings: SAFETY_SETTINGS,
        }
    });

    return response;
  }
}
