import { ResultImage, ToolType } from '../types';

export class ResultParser {
  static parseServerResponse(
    data: any,
    fallbackUrl: string,
    tool: ToolType,
    toolLabel: string,
    prompt: string,
    beforeUrl?: string
  ): ResultImage[] {
    const timestamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const results: ResultImage[] = [];

    if (data && data.generatedImages && data.generatedImages.length > 0) {
      data.generatedImages.forEach((url: string, idx: number) => {
        results.push({
          id: `res_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
          dataUrl: url,
          beforeDataUrl: beforeUrl,
          timestamp,
          tool,
          toolLabel: data.generatedImages.length > 1 ? `${toolLabel} (옵션 ${idx + 1})` : toolLabel,
          prompt,
          aspectRatio: data.meta?.aspectRatio || '1:1',
          quality: '1K',
        });
      });
    } else {
      results.push({
        id: `res_${Date.now()}_fallback`,
        dataUrl: fallbackUrl,
        beforeDataUrl: beforeUrl,
        timestamp,
        tool,
        toolLabel,
        prompt,
        aspectRatio: '1:1',
        quality: '1K',
      });
    }

    return results;
  }
}
