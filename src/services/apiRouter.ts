import { ImageTaskRequest } from '../types';
import { validateTask } from './taskValidator';
import { PromptBuilder } from './promptBuilder';
import { processCanvasImage } from '../utils/canvasProcessor';

export async function runImageTask(task: ImageTaskRequest): Promise<string[]> {
  validateTask(task);

  const internalPrompt = PromptBuilder.buildToolPrompt(task);

  // 1. Local high-precision canvas processor for instant fallback / local preview
  const canvasResultUrl = await processCanvasImage(task);

  // 2. Call server-side Nano Banana Gemini endpoint
  try {
    const response = await fetch('/api/nano-banana/process-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task,
        internalPrompt,
      }),
    });

    const data = await response.json();
    if (data.generatedImages && data.generatedImages.length > 0) {
      return data.generatedImages;
    }
  } catch (err) {
    console.warn('Server process image network exception:', err);
  }

  return [canvasResultUrl];
}

export async function safelyRunImageTask(
  task: ImageTaskRequest,
  setProcessing: (b: boolean) => void,
  setError: (msg: string | null) => void,
  onSuccess: (results: string[]) => void
): Promise<void> {
  try {
    setProcessing(true);
    setError(null);

    const results = await runImageTask(task);
    onSuccess(results);
  } catch (error) {
    setError(
      error instanceof Error ? error.message : '이미지 처리 중 오류가 발생했습니다.'
    );
  } finally {
    setProcessing(false);
  }
}
