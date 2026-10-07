import { AppState, ResultImage, ImageTool, UploadedImage } from '../types';
import { PromptBuilder } from './promptBuilder';
import { processCanvasImage } from '../utils/canvasProcessor';
import { ResultParser } from './resultParser';
import { TOOL_DEFINITIONS } from '../components/ToolSelector';

export interface ExecuteTaskParams {
  tool: ImageTool;
  sourceImages: UploadedImage[];
  prompt: string;
  state: AppState;
  identityLock: boolean;
  onStepChange?: (step: '요청 준비 중' | '이미지 처리 중' | '결과 생성 중') => void;
}

export class GeminiImageService {
  static async executeImageTask(params: ExecuteTaskParams): Promise<ResultImage[]> {
    const { tool, sourceImages, state, identityLock, onStepChange } = params;

    if (onStepChange) onStepChange('요청 준비 중');

    const sourceImg = sourceImages.find((img) => img.id === state.activeImageId) || sourceImages.find((img) => img.role === 'SOURCE') || sourceImages[0];

    const sourceImagesPayload = sourceImages.map((i) => ({
      role: i.role,
      mimeType: i.dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png',
      base64: i.dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
    }));

    const taskRequest = {
      tool,
      userPrompt: params.prompt || state.userPrompt || state.enhancedPrompt,
      sourceImages: sourceImagesPayload,
      identityLock,
      aspectRatio: state.aspectRatio,
      quality: state.quality,
      outputCount: state.outputCount,
      options: { ...state },
    };

    const fullPrompt = PromptBuilder.buildToolPrompt(taskRequest);

    if (onStepChange) onStepChange('이미지 처리 중');

    const canvasResultUrl = await processCanvasImage(taskRequest);

    if (onStepChange) onStepChange('결과 생성 중');

    let serverData: any = null;
    try {
      const response = await fetch('/api/nano-banana/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: taskRequest,
          internalPrompt: fullPrompt,
        }),
      });

      serverData = await response.json();
    } catch (err) {
      console.warn('Server process image network exception:', err);
    }

    const toolDef = TOOL_DEFINITIONS.find((t) => t.id === tool);
    const toolLabel = toolDef?.label || '편집';

    return ResultParser.parseServerResponse(
      serverData,
      canvasResultUrl,
      tool,
      toolLabel,
      fullPrompt,
      sourceImg?.dataUrl
    );
  }
}
