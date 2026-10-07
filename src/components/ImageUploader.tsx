import React, { useRef, useState } from 'react';
import { ImageRole, UploadedImage } from '../types';
import { Upload, Eye, Trash2, ImageIcon, X } from 'lucide-react';
import { ImageValidator } from '../services/imageValidator';

interface ImageUploaderProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  activeImageId: string | null;
  setActiveImageId: (id: string | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  setImages,
  activeImageId,
  setActiveImageId,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  const handleFileUpload = (files: FileList | null) => {
    const { validFiles, error } = ImageValidator.validateUpload(files, images);
    if (error) {
      alert(error);
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImages((prev) => {
          if (prev.length >= 3) return prev;
          const defaultRole = ImageValidator.getDefaultRole(prev);

          const newImg: UploadedImage = {
            id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            dataUrl,
            name: file.name,
            role: defaultRole,
            size: file.size,
          };

          if (prev.length === 0) {
            setActiveImageId(newImg.id);
          }

          return [...prev, newImg];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (activeImageId === id) {
        setActiveImageId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const handleChangeRole = (id: string, newRole: ImageRole) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, role: newRole } : img))
    );
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  return (
    <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-indigo-400" />
          이미지 업로드
        </label>
        <span className="text-[11px] font-semibold text-slate-400">
          ({images.length} / 3장)
        </span>
      </div>

      {/* Drag & Drop Box */}
      {images.length < 3 && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-indigo-400 bg-indigo-500/10'
              : 'border-slate-800 hover:border-indigo-500/60 bg-slate-900/50 hover:bg-slate-900'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
          />
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-inner">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200">
              클릭하여 파일 선택 또는 Drag & Drop
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              JPG, JPEG, PNG, WEBP (최대 3장)
            </p>
          </div>
        </div>
      )}

      {/* Uploaded Images Cards */}
      <div className="space-y-2">
        {images.map((img, idx) => {
          const isActive = img.id === activeImageId;
          return (
            <div
              key={img.id}
              onClick={() => setActiveImageId(img.id)}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/10 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 group">
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalImg(img.dataUrl);
                  }}
                  className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  title="확대 보기"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                </button>
              </div>

              {/* Info & Role */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-slate-200 truncate" title={img.name}>
                    {img.name}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(idx, 'up');
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-200 p-0.5"
                        title="위로 이동"
                      >
                        ▲
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(idx, 'down');
                        }}
                        className="text-[10px] text-slate-400 hover:text-slate-200 p-0.5"
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(img.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[10px] text-slate-400">역할:</span>
                  <select
                    value={img.role}
                    onChange={(e) => handleChangeRole(img.id, e.target.value as ImageRole)}
                    className="text-[11px] bg-slate-950 text-indigo-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="SOURCE">📸 원본</option>
                    <option value="REFERENCE">🖼️ 참조</option>
                    <option value="COMPOSITE">🧩 합성 대상</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}

        {images.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-500 border border-slate-800/80 rounded-xl bg-slate-900/30">
            업로드된 이미지가 없습니다. 사진을 업로드하거나 샘플을 불러와주세요.
          </div>
        )}
      </div>

      {/* Modal Preview */}
      {previewModalImg && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImg(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-slate-900 p-2 rounded-2xl border border-slate-700 shadow-2xl">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImg}
              alt="Preview"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
