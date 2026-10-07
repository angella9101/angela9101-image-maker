import React from 'react';
import { PRESET_IDEA_SUGGESTIONS } from '../data/sampleImages';
import { MessageSquare, RotateCcw } from 'lucide-react';

interface PromptInputProps {
  idea: string;
  setIdea: (val: string) => void;
  onClear: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ idea, setIdea, onClear }) => {
  return (
    <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          원하는 작업을 설명해주세요
        </label>
        {idea && (
          <button
            onClick={onClear}
            className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            지우기
          </button>
        )}
      </div>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="예)&#10;얼굴은 그대로 유지하고 배경만 밝은 스튜디오로 바꿔줘.&#10;두 번째 사진의 강아지를 첫 번째 사진 오른쪽에 자연스럽게 합성해줘.&#10;오래된 흑백사진의 손상 부분을 복원해줘."
        className="w-full h-28 bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 resize-none transition-all leading-relaxed"
      />

      {/* Preset Suggestion Chips */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold text-slate-400">자주 쓰는 요청 예시:</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_IDEA_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => setIdea(sug)}
              className="text-[11px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-all text-left truncate max-w-[220px]"
              title={sug}
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
