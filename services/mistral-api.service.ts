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
        const messages = history.flatMap((msg) => {
            if (!msg.parts.length) return [];

            const message = {
                role: msg.role == IHRole.model ? 'assistant' : 'user',
                content: '',
            };

            if (msg.parts.find((part) => part.type === TypePartEnum.image)) {
                throw Error('Image part type is not supported');
            }

            message.content = msg.parts[0].text;

            return message;
        });

        const generateAI = new Mistral({
            apiKey: MISTRAL_API_KEY,
        });

        const stream = await generateAI.chat.stream({
            model: "mistral-large-latest",
            messages,
            temperature: 1,
            stream: true,
        });

        return stream;
    }
}
