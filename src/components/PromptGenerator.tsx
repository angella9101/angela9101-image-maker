import React from 'react';
import { Wand2, RefreshCw, Check, Sliders } from 'lucide-react';

interface PromptGeneratorProps {
  idea: string;
  prompt: string;
  setPrompt: (val: string) => void;
  onGeneratePrompt: () => void;
  isGenerating: boolean;
}

export const PromptGenerator: React.FC<PromptGeneratorProps> = ({
  idea,
  prompt,
  setPrompt,
  onGeneratePrompt,
  isGenerating,
}) => {
  return (
    <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 shadow-sm">
      <button
        onClick={onGeneratePrompt}
        disabled={isGenerating || !idea.trim()}
        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
          isGenerating
            ? 'bg-indigo-500/30 text-indigo-200 cursor-wait border border-indigo-500/40'
            : idea.trim()
            ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25 active:scale-[0.99]'
            : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
        }`}
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            <span>AI 프롬프트 분석 및 최적화 중...</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 text-indigo-300" />
            <span>✨ AI 프롬프트 자동 생성</span>
          </>
        )}
      </button>

      {/* Generated Prompt Editor */}
      {prompt && (
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-indigo-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              AI 최적화 프롬프트 (수정 가능):
            </span>
            <button
              onClick={() => setPrompt(idea)}
              className="text-slate-400 hover:text-slate-200 text-[10px] underline"
            >
              원본 아이디어 복원
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-slate-900 border border-indigo-500/40 rounded-xl p-3 text-xs text-indigo-200 focus:outline-none focus:border-indigo-400 font-mono resize-none leading-relaxed"
          />

          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Identity Lock 지침 및 품질 매개변수가 자동 구방 통합되었습니다.</span>
          </div>
        </div>
      )}
    </div>
  );
};
