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
        const messages: ChatCompletionMessageParam[] = history.flatMap(
            (msg) => {
                if (!msg.parts.length) return [];

                const message = {
                    role: msg.role == IHRole.model ? 'assistant' : 'user',
                    content: null,
                };

                if (modelAi == AiEngineEnum.QWENAI) {
                    if (
                        msg.parts.find(
                            (part) => part.type === TypePartEnum.image
                        )
                    ) {
                        throw Error('Image part type is not supported');
                    }
                }

                if (modelAi == AiEngineEnum.DEEPSEEK) {
                    if (
                        msg.parts.find(
                            (part) => part.type === TypePartEnum.image
                        )
                    ) {
                        throw Error('Image part type is not supported');
                    }

                    message.content = msg.parts[0].text;
                } else {
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
                }

                return message;
            }
        );

        const models = {
            [AiEngineEnum.OPENAI]: 'gpt-4o-2024-08-06',
            [AiEngineEnum.DEEPSEEK]: DeepSeeKModelsEnum.DEEPSEEK_CHAT,
            [AiEngineEnum.QWENAI]: 'qwen-max-latest',
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
