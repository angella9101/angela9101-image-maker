import { ImageTaskRequest } from '../types';

export function validateTask(task: ImageTaskRequest): void {
  const needsSource = !['GENERATE'].includes(task.tool);

  if (needsSource && (!task.sourceImages || task.sourceImages.length === 0)) {
    throw new Error('먼저 원본 이미지를 업로드해주세요.');
  }

  if (task.tool === 'COMPOSITE' && (task.sourceImages?.length || 0) < 2) {
    throw new Error('이미지 합성에는 최소 2장의 이미지가 필요합니다.');
  }
}
