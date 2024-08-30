import { Request, Response, Router } from "express";

const { OpenAI } = require('openai');

const api = new OpenAI({
  baseURL: 'https://api.deepinfra.com/v1/openai',
  apiKey: process.env.OPENAI_API_KEY,
});

const getAIResponse = async (req: Request, res: Response) => {
    const prompt = req.body;
    const result = await api.chat.completions.create({
        model: 'google/gemma-2-9b-it',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant who helps developers. Please explain it as briefly as possible.',
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      });
    const message = result.choices[0].message.content;
    return res.json(message);
};

const router = Router();
router.post("/:identifier/:slug", getAIResponse)
export default router;