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

        const messages: ChatCompletionMessageParam[] = history.flatMap(
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

        let BASE_URL = '';
        let API_KEY = '';
        let generateAI = null;

        switch (modelAi) {
            case AiEngineEnum.DEEPSEEK:
                BASE_URL = DEEPSEEK_API_URL;
                API_KEY = DEEPSEEK_API_KEY;
                break;

            case AiEngineEnum.QWENAI:
                BASE_URL = QWENAI_API_URL;
                API_KEY = QWENAI_API_KEY;

                if (hasImage) modelAi = AiEngineEnum.QWENAI_VISION;
                break;

            case AiEngineEnum.GROK:
                BASE_URL = GROK_API_URL;
                API_KEY = GROK_API_KEY;

                if (hasImage) modelAi = AiEngineEnum.GROK_VISION;
                break;

            case AiEngineEnum.PERPLEXITY:
                BASE_URL = PERPLEXITY_API_URL;
                API_KEY = PERPLEXITY_API_KEY;
                break;

            default:
                generateAI = new OpenAI();
                break;
        }

        if (generateAI == null) {
            generateAI = new OpenAI({
                apiKey: API_KEY,
                baseURL: BASE_URL,
            });
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
