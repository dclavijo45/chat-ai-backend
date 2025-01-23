import { Router } from 'express';
import { DeepSeekApiService } from '../services/deepseek-api.service';

const router = Router();

router.post('/chat/start', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');

    const deepseekApiService = new DeepSeekApiService();

    const { history } = req.body;

    const result = await deepseekApiService.conversation([history]);

    res.write(result);
    res.end();
});

router.post('/chat/conversation', async (req, res) => {
    res.setHeader('Content-Type', 'text/plain');

    const deepseekApiService = new DeepSeekApiService();

    const { history } = req.body;

    const result = await deepseekApiService.conversation(history);

    res.write(result);
    res.end();
});

export default router;
