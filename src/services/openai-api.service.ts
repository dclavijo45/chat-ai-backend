import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Stream } from "openai/streaming";
import { IHRole, IHistory, TypePartEnum } from "../interfaces/history.model";

export class OpenaiApiService {
  constructor() {
    this.generateAI = new OpenAI();
  }

  private generateAI: OpenAI;

  async start(
    history: IHistory
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const message: ChatCompletionMessageParam = {
      role: IHRole.user,
      content: [],
    };  

    const content = [];

    for (const msg of history.parts) {
      if (msg.type == TypePartEnum.image) {
        content.push({
          type: "image_url",
          image_url: {
            url: msg.text,
            detail: "low",
          },
        });
      }

      if (msg.type == TypePartEnum.text) {
        content.push({
          type: msg.type,
          text: msg.text,
        });
      }
    }

    message.content = content;

    const stream = await this.generateAI.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [message],
      temperature: 1,
      stream: true,
      max_tokens: 300,
    });

    return stream;
  }

  async conversation(
    history: IHistory[]
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const messages: ChatCompletionMessageParam[] = history.flatMap((msg) => {
      if (!msg.parts.length) return [];

      const message = {
        role: msg.role == IHRole.model ? "assistant" : "user",
        content: [],
      };

      const content = msg.parts.map((part) => {
        if (part.type == TypePartEnum.image) {
          return {
            type: "image_url",
            image_url: {
              url: part.text,
              detail: "low",
            },
          };
        }

        if (part.type == TypePartEnum.text) {
          return {
            type: part.type,
            text: part.text,
          };
        }
      });

      message.content = content;

      return message;
    });

    const stream = await this.generateAI.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages,
      temperature: 1,
      stream: true,
      max_tokens: 300,
    });

    return stream;
  }
}
