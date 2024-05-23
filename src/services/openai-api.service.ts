import { Content } from "@google/generative-ai";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { Stream } from "openai/streaming";

export class OpenaiApiService {
  constructor() {
    this.generateAI = new OpenAI();
  }

  private generateAI: OpenAI;

  async start(
    userPrompt: string
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const stream = await this.generateAI.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages: [
        {
          role: "user",
          content: userPrompt,
        }
      ],
      temperature: 1,
      stream: true,
    });

    return stream;
  }

  async conversation(
    history: Content[],
    userPrompt: string
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const messages: ChatCompletionMessageParam[] = history.map((msg) => {
      return {
        role: msg.role == "model" ? "assistant" : "user",
        content: msg.parts.length ? msg.parts[0].text : "",
      };
    });

    messages.push({
      role: "user",
      content: userPrompt,
    });

    const stream = await this.generateAI.chat.completions.create({
      model: "gpt-4o-2024-05-13",
      messages,
      temperature: 1,
      stream: true,
    });

    return stream;
  }
}
