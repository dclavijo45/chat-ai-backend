import Anthropic from "@anthropic-ai/sdk";
import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources";
import { IHRole, IHistory, TypePartEnum } from "../models/message-ai.model";

export class AnthropicApiService {
  constructor() {
    this.generateAI = new Anthropic();
  }

  private generateAI: Anthropic;

  async start(history: IHistory): Promise<MessageStream> {
    const message: Anthropic.Messages.MessageParam = {
      role: IHRole.user,
      content: [],
    };

    const content:
      | string
      | (
          | Anthropic.Messages.TextBlockParam
          | Anthropic.Messages.ImageBlockParam
        )[] = [];

    for (const msg of history.parts) {
      if (msg.type == TypePartEnum.image) {
        const imageInfo = msg.text.split(",");
        const mimeType = imageInfo[0].split(":")[1].split(";")[0];
        const compatibleMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];

        if (!compatibleMimeTypes.includes(mimeType)) {
          continue;
        }

        content.push({
          type: TypePartEnum.image,
          source: {
            data: imageInfo[1],
            type: "base64",
            media_type: mimeType as ImageBlockParam.Source["media_type"],
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

    const stream = await this.generateAI.messages.stream({
      model: "claude-3-5-sonnet-latest",
      messages: [message],
      temperature: 1,
      max_tokens: 3000,
    });

    return stream;
  }

  async conversation(
    history: IHistory[]
  ): Promise<MessageStream> {
    const messages: Anthropic.Messages.MessageParam[] = history.flatMap((msg) => {
      if (!msg.parts.length) return [];

      const message: Anthropic.Messages.MessageParam = {
        role: msg.role == IHRole.model ? "assistant" : "user",
        content: [],
      };

      const content = msg.parts.flatMap((part) => {
        if (part.type == TypePartEnum.image) {
          const imageInfo = part.text.split(",");
          const mimeType = imageInfo[0].split(":")[1].split(";")[0];
          const compatibleMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ];

          if (!compatibleMimeTypes.includes(mimeType)) return []

          return {
            type: TypePartEnum.image,
            source: {
              data: imageInfo[1],
              type: "base64",
              media_type: mimeType as ImageBlockParam.Source["media_type"],
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

    const stream = await this.generateAI.messages.stream({
      model: "claude-3-5-sonnet-latest",
      messages,
      temperature: 1,
      max_tokens: 3000,
    });

    return stream;
  }
}
