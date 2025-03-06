export interface MessageAiRequest {
    /**
     * @description The list of messages exchanged between the user and the AI engine.
     */
    history: IHistory[];

    /**
     * @description The AI engine to be used.
     */
    aiEngine: AiEngineEnum;

    /**
     * @description The conversation ID of message.
     */
    conversationId: string;
}

export interface MessageAiResponse {
    /**
     * @description The conversation ID.
     */
    conversationId: string;

    /**
     * @description Content part message.
     */
    messageChunk: string;

    /**
     * @description The state of the message.
     */
    state: StateMessageEnum;
}

export interface IHistory {
    /**
     * @description The role of the message.
     */
    role: IHRole,
    /**
     * @description The parts of the message.
     */
    parts: Part[]
}

export enum IHRole {
    user = 'user',
    model = 'model'
}

interface Part {
    type: TypePartEnum
    text: string
}

export enum TypePartEnum {
    text = 'text',
    image = 'image'
}

export enum AiEngineEnum {
    OPENAI = 'openai',
    GEMINI = 'gemini',
    ANTHROPIC = 'anthropic',
    DEEPSEEK = 'deepseek',
    QWENAI = 'qwenai',
    QWENAI_VISION = 'qwenai_vision',
    MISTRAL = 'mistral',
    GROK = 'grok',
    GROK_VISION = 'grok_vision',
    PERPLEXITY = 'perplexity',
}

export enum StateMessageEnum {
    STREAMING = 'streaming',
    END_STREAMING = 'end_streaming',
}
