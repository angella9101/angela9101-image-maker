import React from 'react';
import { ControlOptions } from '../types';
import { RefreshCw, Maximize, Palette } from 'lucide-react';

interface RestorationControlsProps {
  options: ControlOptions;
  setOptions: React.Dispatch<React.SetStateAction<ControlOptions>>;
}

export const RestorationControls: React.FC<RestorationControlsProps> = ({ options, setOptions }) => {
  const updateOption = <K extends keyof ControlOptions>(key: K, value: ControlOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
      {/* Tool: Restore */}
      {options.activeTool === 'RESTORE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              사진 복원 강도 설정
            </span>
            <span className="text-[10px] text-slate-400">찢김 · 먼지 · 얼룩 · 변색 복원</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'light', label: '약하게' },
              { id: 'normal', label: '보통 (기본값)' },
              { id: 'strong', label: '강하게' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => updateOption('restoreIntensity', lvl.id as any)}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                  options.restoreIntensity === lvl.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tool: Upscale */}
      {options.activeTool === 'UPSCALE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Maximize className="w-4 h-4 text-indigo-400" />
              업스케일 배율 선택
            </span>
            <span className="text-[10px] text-slate-400">얼굴 왜곡 없는 디테일 복원</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: '2x', label: '2× 해상도 향상' },
              { id: '4x', label: '4× 초고해상도 향상' },
            ].map((up) => (
              <button
                key={up.id}
                onClick={() => updateOption('upscaleFactor', up.id as any)}
                className={`py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                  options.upscaleFactor === up.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {up.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tool: Colorize */}
      {options.activeTool === 'COLORIZE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-400" />
              흑백 → 컬러 톤 설정
            </span>
            <span className="text-[10px] text-slate-400">자연스러운 인물 & 시대 감성 컬러</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'natural', label: '자연스러운 색상' },
              { id: 'warm', label: '따뜻한 색상' },
              { id: 'vibrant', label: '선명한 색상' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => updateOption('colorizeTone', c.id as any)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  options.colorizeTone === c.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
