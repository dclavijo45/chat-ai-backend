import express, { Application } from 'express';
import http from 'http';
import { Socket, Server as SocketIOServer } from 'socket.io';
import { GlobalMessage } from './models/global-message.model';
import {
    AiEngineEnum,
    MessageAiRequest,
    MessageAiResponse,
    StateMessageEnum,
} from './models/message-ai.model';
import { AnthropicApiService } from './services/anthropic-api.service';
import { CommonApiService } from './services/common-api.service';
import { GeminiApiService } from './services/gemini-api.service';
import { MistralApiService } from './services/mistral-api.service';

const app: Application = express();
const server: http.Server = http.createServer(app);
const io: SocketIOServer = new SocketIOServer(server);

app.use(express.json());

const anthropicApiService = new AnthropicApiService();
const geminiApiService = new GeminiApiService();
const commonApiService = new CommonApiService();
const mistralApiService = new MistralApiService();

io.on('connection', (socket: Socket) => {
    socket.on('ping', (data: GlobalMessage<string>) => {
        const response: GlobalMessage<string> = {
            payload: 'pong',
        };

        socket.emit('pong', response);
    });

    socket.on('message', async (request: GlobalMessage<MessageAiRequest>) => {
        const response: GlobalMessage<MessageAiResponse> = {
            payload: {
                messageChunk: '',
                conversationId: request.payload.conversationId,
                state: StateMessageEnum.STREAMING,
            },
        };

        try {
            switch (request.payload.aiEngine) {
                case AiEngineEnum.ANTHROPIC:
                    const resultAnthropic =
                        await anthropicApiService.conversation(
                            request.payload.history
                        );

                    resultAnthropic.on('text', (text) => {
                        response.payload.messageChunk = text;
                        socket.emit('message', response);
                    });

                    await resultAnthropic.done();

                    response.payload.messageChunk = '';
                    break;

                case AiEngineEnum.GEMINI:
                    const resultGemini = await geminiApiService.conversation(
                        request.payload.history
                    );

                    for await (const chunk of resultGemini) {
                        response.payload.messageChunk = chunk.text || '';
                        socket.emit('message', response);
                    }

                    response.payload.messageChunk = '';
                    break;

                case AiEngineEnum.MISTRAL:
                    const resultMistral = await mistralApiService.conversation(
                        request.payload.history
                    );

                    for await (const chunk of resultMistral) {
                        const streamText = chunk.data.choices[0].delta.content;
                        response.payload.messageChunk = streamText;
                        socket.emit('message', response);
                    }

                    response.payload.messageChunk = '';
                    break;

                default:
                    const result = await commonApiService.conversation(
                        request.payload.history,
                        request.payload.aiEngine
                    );

                    for await (const chunk of result) {
                        response.payload.messageChunk =
                            chunk.choices[0]?.delta?.content || '';
                        socket.emit('message', response);
                    }

                    response.payload.messageChunk = '';
                    break;
            }
        } catch (error) {
            console.error(error);
            response.payload.messageChunk = 'An error occurred';
        } finally {
            response.payload.state = StateMessageEnum.END_STREAMING;
            socket.emit('message', response);
        }
    });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
