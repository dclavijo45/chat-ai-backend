import { Mistral } from '@mistralai/mistralai';
import { MISTRAL_API_KEY } from '../config/mistral-api.config';
import {
    AiEngineEnum,
    IHistory,
    IHRole,
    TypePartEnum,
} from '../models/message-ai.model';

export class MistralApiService {
    /**
     * Start a conversation with AI API
     * @param history The history of the conversation
     *
     * @returns The response stream
     */
    async conversation(
        history: IHistory[]
    ): Promise<any> {
        let hasImage = false;

        const messages = history.flatMap((msg) => {
            if (!msg.parts.length) return [];

            const message = {
                role: msg.role == IHRole.model ? 'assistant' : 'user',
                content: [],
            };

            hasImage = msg.parts.some((part) => part.type === TypePartEnum.image);

            const content = msg.parts.map((part) => {
                if (part.type == TypePartEnum.image) {
                    return {
                        type: 'image_url',
                        imageUrl: part.text
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

        const generateAI = new Mistral({
            apiKey: MISTRAL_API_KEY
        });

        const stream = await generateAI.chat.stream({
            model: hasImage ? "pixtral-12b-2409" : "mistral-large-latest",
            messages,
            temperature: 1
        });

        return stream;
    }
}
