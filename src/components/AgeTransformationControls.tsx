import React from 'react';
import { ControlOptions } from '../types';
import { Calendar, AlertCircle } from 'lucide-react';

interface AgeTransformationControlsProps {
  options: ControlOptions;
  setOptions: React.Dispatch<React.SetStateAction<ControlOptions>>;
}

export const AgeTransformationControls: React.FC<AgeTransformationControlsProps> = ({ options, setOptions }) => {
  const updateOption = <K extends keyof ControlOptions>(key: K, value: ControlOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-400" />
          인생앨범 (연령 변환) 설정
        </span>
        <span className="text-[10px] text-slate-400">얼굴 정체성 보존 연령 변환</span>
      </div>

      {/* Disclaimer Box */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 p-3 rounded-xl flex items-start gap-2.5 text-indigo-200 text-xs">
        <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          “AI가 생성한 예상 이미지이며 실제 미래 모습과 다를 수 있습니다.”
        </p>
      </div>

      {/* Age Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-slate-300">현재 나이 (세):</label>
          <input
            type="number"
            min="1"
            max="100"
            value={options.currentAge}
            onChange={(e) => updateOption('currentAge', parseInt(e.target.value) || 20)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-indigo-200 font-bold focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-300">목표 나이 (세):</label>
          <input
            type="number"
            min="1"
            max="100"
            value={options.targetAge}
            onChange={(e) => updateOption('targetAge', parseInt(e.target.value) || 50)}
            className="w-full bg-slate-900 border border-indigo-500/80 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Quick Age Presets */}
      <div className="space-y-1.5">
        <label className="text-xs text-slate-400">빠른 목표 나이 선택:</label>
        <div className="flex flex-wrap gap-1.5">
          {[10, 20, 30, 50, 70, 80].map((age) => (
            <button
              key={age}
              onClick={() => updateOption('targetAge', age)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                options.targetAge === age
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {age}세
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
