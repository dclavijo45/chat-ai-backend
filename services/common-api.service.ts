import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { Stream } from 'openai/streaming';
import {
    DEEPSEEK_API_KEY,
    DEEPSEEK_API_URL,
} from '../config/deepseek-api.config';
import { QWENAI_API_KEY, QWENAI_API_URL } from '../config/qwenai-api.config';
import { DeepSeeKModelsEnum } from '../enums/deepseek.enum';
import {
    AiEngineEnum,
    IHistory,
    IHRole,
    TypePartEnum,
} from '../models/message-ai.model';
import { GROK_API_KEY, GROK_API_URL } from '../config/grok-api.config';
import {
    PERPLEXITY_API_KEY,
    PERPLEXITY_API_URL,
} from '../config/perplexity-api.config';

export class CommonApiService {
    /**
     * Start a conversation with AI API
     * @param history The history of the conversation
     * @param modelAi The AI model
     *
     * @returns The response stream
     */
    async conversation(
        history: IHistory[],
        modelAi: AiEngineEnum
    ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        let hasImage = false;

        let messages: ChatCompletionMessageParam[] = history.flatMap(
            (msg) => {
                if (!msg.parts.length) return [];

                const message = {
                    role: msg.role == IHRole.model ? 'assistant' : 'user',
                    content: null,
                };

                hasImage = hasImage || msg.parts.some(
                    (part) => part.type === TypePartEnum.image
                );

                if (
                    [
                        AiEngineEnum.DEEPSEEK,
                        AiEngineEnum.PERPLEXITY,
                    ].includes(modelAi) &&
                    hasImage
                ) {
                    throw Error('Image part type is not supported');
                }

                const content = msg.parts.map((part) => {
                    if (part.type == TypePartEnum.image) {
                        return {
                            type: 'image_url',
                            image_url: {
                                url: part.text,
                                detail: 'low',
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
            }
        );

        const models = {
            [AiEngineEnum.OPENAI]: 'gpt-4o-2024-08-06',
            [AiEngineEnum.DEEPSEEK]: DeepSeeKModelsEnum.DEEPSEEK_CHAT,
            [AiEngineEnum.QWENAI]: 'qwen-max-latest',
            [AiEngineEnum.QWENAI_VISION]: 'qwen-vl-max',
            [AiEngineEnum.GROK]: 'grok-2-latest',
            [AiEngineEnum.GROK_VISION]: 'grok-2-vision-latest',
            [AiEngineEnum.PERPLEXITY]: 'sonar-pro',
        };

        const clientOptions = {
            [AiEngineEnum.OPENAI]: {
                apiKey: undefined,
                baseURL: undefined,
            },
            [AiEngineEnum.DEEPSEEK]: {
                apiKey: DEEPSEEK_API_KEY,
                baseURL: DEEPSEEK_API_URL,
            },
            [AiEngineEnum.QWENAI]: {
                apiKey: QWENAI_API_KEY,
                baseURL: QWENAI_API_URL,
            },
            [AiEngineEnum.GROK]: {
                apiKey: GROK_API_KEY,
                baseURL: GROK_API_URL,
            },
            [AiEngineEnum.PERPLEXITY]: {
                apiKey: PERPLEXITY_API_KEY,
                baseURL: PERPLEXITY_API_URL,
            },
        };

        const generateAI = new OpenAI({
            apiKey: clientOptions[modelAi].apiKey,
            baseURL: clientOptions[modelAi].baseURL,
        });

        switch (modelAi) {
            case AiEngineEnum.DEEPSEEK:
                messages = messages.map((msg) => {
                    if (msg.role == 'assistant') {
                        msg.content = msg.content[0]['text'];
                    }

                    return msg;
                });
                break;

            case AiEngineEnum.QWENAI:
                if (hasImage) modelAi = AiEngineEnum.QWENAI_VISION;
                break;

            case AiEngineEnum.GROK:
                if (hasImage) modelAi = AiEngineEnum.GROK_VISION;
                break;

            default:
                break;
        }

        const stream = await generateAI.chat.completions.create({
            model: models[modelAi],
            messages,
            temperature: 1,
            stream: true,
        });

        return stream;
    }
}
