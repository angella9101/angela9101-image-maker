import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json({ limit: '50mb' }));

// Shared Gemini AI instance
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. AI Structured Prompt Generator Endpoint (Section 23)
app.post('/api/nano-banana/enhance-prompt', async (req, res) => {
  try {
    const { idea, tool = 'GENERATE' } = req.body;
    if (!idea) {
      return res.status(400).json({ error: '아이디어를 입력해주세요.' });
    }

    const ai = getAIClient();
    if (!ai) {
      const fallback = generateStructuredPromptFallback(idea, tool);
      return res.json({ enhancedPrompt: fallback });
    }

    const systemInstruction = `Convert the user's Korean image-editing request into a clear professional image-generation instruction.

Do not change the user's intention.

Return only an editable Korean prompt.

Include when relevant:
- subject
- requested edit
- preserve instructions
- composition
- lighting
- style
- background
- identity consistency
- negative constraints

Never invent a change that the user did not request.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `사용자 요청:\n${idea}\n작업 툴: ${tool}`,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const enhancedPrompt = response.text?.trim() || generateStructuredPromptFallback(idea, tool);
    res.json({ enhancedPrompt });
  } catch (error: any) {
    console.error('Enhance prompt error:', error);
    res.json({ enhancedPrompt: generateStructuredPromptFallback(req.body.idea || '', req.body.tool) });
  }
});

function generateStructuredPromptFallback(idea: string, tool: string): string {
  const base = idea || '인물 사진 정밀 편집';
  return `TASK: ${base}
SOURCE IMAGE: Primary subject identity lock
PRESERVE: Face shape, eyes, nose, lips, skin tone, hairstyle, body proportions
EDIT TARGET: Requested attributes only
LIGHTING: Balanced studio lighting
STYLE: High-resolution realistic photography
NEGATIVE CONSTRAINTS: Do not alter facial anatomy, no plastic smoothing, no unnatural face morphing`;
}

// 2. Main Image Processing Endpoint (Sections 1-3)
app.post('/api/nano-banana/process-image', async (req, res) => {
  try {
    const { task, internalPrompt: providedPrompt } = req.body;
    const tool = task?.tool || 'GENERATE';
    const userPrompt = task?.userPrompt || '';
    const aspectRatio = task?.aspectRatio || '1:1';
    const quality = task?.quality || '1K';
    const sourceImages = task?.sourceImages || [];

    const fullPrompt = providedPrompt || userPrompt || 'AI 사진스튜디오 정밀 편집';

    const ai = getAIClient();
    const parts: any[] = [];

    // Add input image parts
    sourceImages.forEach((img: any) => {
      if (img.base64) {
        const cleanBase64 = img.base64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: img.mimeType || 'image/png',
            data: cleanBase64,
          },
        });
      }
    });

    parts.push({ text: fullPrompt });

    const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
    const chosenRatio = validRatios.includes(aspectRatio) ? aspectRatio : '1:1';

    let generatedImages: string[] = [];

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: chosenRatio as any,
              imageSize: quality as any,
            },
          },
        });

        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mime = part.inlineData.mimeType || 'image/png';
              generatedImages.push(`data:${mime};base64,${part.inlineData.data}`);
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini call executed fallback processor:', geminiErr.message || geminiErr);
      }
    }

    res.json({
      success: true,
      usingFallbackEngine: generatedImages.length === 0,
      generatedImages,
      meta: { tool, prompt: fullPrompt, aspectRatio: chosenRatio },
    });
  } catch (err: any) {
    console.error('Process image error:', err);
    res.status(500).json({ error: err.message || '이미지 처리 중 오류가 발생했습니다.' });
  }
});

// Vite Full-Stack Integration
async function startServer() {
  const PORT = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const template = await vite.transformIndexHtml(
          url,
          `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI 사진스튜디오 - 정밀 인물 보정 및 편집 스튜디오</title>
    <meta name="description" content="원본 인물의 정체성을 보존하며 정밀한 사진 편집, 복원, 여권/스튜디오 사진, 합성, 인생앨범을 제작하는 전문 AI 사진 스튜디오" />
    <link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
  </head>
  <body class="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`
        );
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Only listen when running standalone server script directly
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`AI 사진스튜디오 Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
