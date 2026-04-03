import type { NextApiRequest, NextApiResponse } from 'next';
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt, imageData } = req.body;

  const content: any[] = [];

  if (imageData) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: imageData.split(',')[1],
      },
    });
  }

  content.push({ type: 'text', text: prompt });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content }],
      }),
    });

    const data = await response.json();
    res.status(200).json({ text: data.content[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Coach feedback failed' });
  }
}