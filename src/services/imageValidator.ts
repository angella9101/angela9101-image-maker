import { UploadedImage, ImageRole } from '../types';

export class ImageValidator {
  static validateUpload(files: FileList | null, currentImages: UploadedImage[]): { validFiles: File[]; error?: string } {
    if (!files || files.length === 0) {
      return { validFiles: [] };
    }

    if (currentImages.length >= 3) {
      return { validFiles: [], error: '이미지는 최대 3장까지 업로드할 수 있습니다.' };
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        return { validFiles: [], error: '지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP만 지원)' };
      }

      // Duplicate check by name and size
      const isDuplicate = currentImages.some((img) => img.name === file.name && img.size === file.size);
      if (isDuplicate) {
        continue;
      }

      if (currentImages.length + validFiles.length < 3) {
        validFiles.push(file);
      }
    }

    return { validFiles };
  }

  static getDefaultRole(existingImages: UploadedImage[]): ImageRole {
    if (existingImages.length === 0) return 'SOURCE';
    if (existingImages.length === 1) return 'REFERENCE';
    return 'COMPOSITE';
  }
}
