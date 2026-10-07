import React from 'react';
import { Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onLoadSamples: () => void;
  onResetAll: () => void;
  activeTaskName: string;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSamples,
  onResetAll,
  activeTaskName,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl tracking-wider">
          🍌
        </div>
        <div>
          <a href="/" className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            AI 사진스튜디오 <span className="text-amber-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">Nano Banana</span>
          </a>
          <p className="text-xs text-slate-400 hidden sm:block">
            정밀 이미지 합성 · 사진 복원 & 업스케일 · 여권/스튜디오 · 피부보정 · 인생앨범
          </p>
        </div>
      </div>

      {/* Zone 2: Navigation Status / Active Task indicator */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-slate-400">현재 작업 모드:</span>
        <span className="font-semibold text-amber-300">{activeTaskName}</span>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onLoadSamples}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
          title="테스트용 예제 사진 불러오기"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>샘플 불러오기</span>
        </button>

        <button
          onClick={onResetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          title="입력 및 옵션 초기화"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>전체 초기화</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>gemini-nano-banana-2.1</span>
        </div>
      </div>
    </header>
  );
};
