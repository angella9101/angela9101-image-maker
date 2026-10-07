import React from 'react';
import { ControlOptions } from '../types';
import { Award } from 'lucide-react';

interface StudioPhotoControlsProps {
  options: ControlOptions;
  setOptions: React.Dispatch<React.SetStateAction<ControlOptions>>;
}

export const StudioPhotoControls: React.FC<StudioPhotoControlsProps> = ({ options, setOptions }) => {
  const updateOption = <K extends keyof ControlOptions>(key: K, value: ControlOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const presets = [
    { id: 'profile', label: '프로필 화보' },
    { id: 'job_hunting', label: '취업 증명' },
    { id: 'business', label: '비즈니스 룩' },
    { id: 'classic', label: '클래식 포토' },
    { id: 'bright_studio', label: '밝은 스튜디오' },
    { id: 'luxury_studio', label: '고급 화보' },
    { id: 'natural_light', label: '창가 자연광' },
  ];

  return (
    <div className="space-y-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-indigo-400" />
          AI 스튜디오 프리셋
        </span>
        <span className="text-[10px] text-slate-400">전문 사진관 촬영 보정</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => updateOption('studioPreset', p.id as any)}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
              options.studioPreset === p.id
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">구도 및 구역:</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'bust', label: '상반신 (Bust)' },
            { id: 'full_body', label: '전신 (Full Body)' },
            { id: 'portrait', label: '얼굴 클로즈업' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => updateOption('studioFraming', f.id as any)}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                options.studioFraming === f.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
