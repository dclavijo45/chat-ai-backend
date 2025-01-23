import {
    DEEPSEEK_API_KEY,
    DEEPSEEK_API_URL,
} from '../config/deepseek-api.config';
import {
    DeepSeeKModelsEnum,
    DeepSeekToolMessageRoleRequestEnum,
} from '../enums/deepseek.enum';
import {
    IDeepSeekMessageRequest,
    IDeepSeekRequest,
    IDeepSeekResponse,
} from '../interfaces/deepseek.model';
import { IHistory, IHRole, TypePartEnum } from '../interfaces/history.model';

export class DeepSeekApiService {
    /**
     * Start a conversation with DeepSeek AI API
     *
     * @param history The history of the conversation
     * @returns The conversation stream
     */
    async conversation(history: IHistory[]): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            if (
                history.find((historyEl) =>
                    historyEl.parts.find(
                        (part) => part.type !== TypePartEnum.text
                    )
                )
            ) {
                return resolve('Image part type is not supported');
            }

            const messages: IDeepSeekMessageRequest[] = history.map(
                (historyEl) => {
                    const part = historyEl.parts[0];

                    return {
                        role:
                            historyEl.role == IHRole.user
                                ? DeepSeekToolMessageRoleRequestEnum.USER
                                : DeepSeekToolMessageRoleRequestEnum.ASSISTANT,
                        content: part.text,
                    };
                }
            );

            const body: IDeepSeekRequest = {
                model: DeepSeeKModelsEnum.DEEPSEEK_CHAT,
                messages,
                stream: false,
            };

            const response = await fetch(
                `${DEEPSEEK_API_URL}/chat/completions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            if (!response.ok) {
                return reject('Failed to call DeepSeek API');
            }

            const data: IDeepSeekResponse = await response.json();

            if (!data || !data.choices || !data.choices.length) {
                return resolve('No response from DeepSeek API');
            }

            const message = data.choices[0].message;

            resolve(message.content ?? 'No response from DeepSeek API');
        });
    }
}
