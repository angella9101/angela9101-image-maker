import React from 'react';
import { GeneratedResult } from '../types';
import { Download, RotateCcw, Copy, Check, Undo2 } from 'lucide-react';

interface DownloadControlsProps {
  result: GeneratedResult;
  onRegenerate: () => void;
  onContinueEditing: (dataUrl: string) => void;
  onResetToOriginal: () => void;
  isProcessing: boolean;
}

export const DownloadControls: React.FC<DownloadControlsProps> = ({
  result,
  onContinueEditing,
  onResetToOriginal,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleDownload = (format: 'png' | 'jpg') => {
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = `AI_Studio_${result.tool}_${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(result.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      alert('클립보드 복사 실패: 다운로드 버튼을 이용해 주세요.');
    }
  };

  const isTransparentFormat = result.tool === 'BACKGROUND_REMOVE';

  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800 rounded-2xl space-y-2 shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div>
          <span className="text-indigo-300 font-bold">{result.toolLabel}</span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span>{result.aspectRatio}</span>
          <span className="mx-1.5 text-slate-600">·</span>
          <span>{result.timestamp}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Continue Editing */}
          <button
            onClick={() => onContinueEditing(result.dataUrl)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
            title="생성 결과를 원본 이미지로 지정하고 이어서 추가 편집합니다."
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>추가 수정</span>
          </button>

          {/* Reset to Original */}
          <button
            onClick={onResetToOriginal}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
            title="최초 원본 상태로 복원합니다."
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>원본 복원</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 flex items-center gap-1 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>

          {/* Downloads: PNG / JPG */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleDownload('png')}
              className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl shadow-md flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG 다운로드{isTransparentFormat ? ' (투명)' : ''}</span>
            </button>
            {!isTransparentFormat && (
              <button
                onClick={() => handleDownload('jpg')}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-xs"
              >
                JPG
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
