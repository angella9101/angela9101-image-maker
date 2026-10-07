import React, { useState, useEffect } from 'react';
import { GeneratedResult, ViewMode } from '../types';
import { BeforeAfterViewer } from './BeforeAfterViewer';
import { DownloadControls } from './DownloadControls';
import { RefreshCw, History, Trash2, AlertCircle } from 'lucide-react';

interface ResultViewerProps {
  results: GeneratedResult[];
  activeResultId: string | null;
  setActiveResultId: (id: string) => void;
  onRefreshResult: () => void;
  onContinueEditing: (dataUrl: string) => void;
  onResetToOriginal: () => void;
  onClearHistory: () => void;
  isProcessing: boolean;
  errorMessage: string | null;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  results,
  activeResultId,
  setActiveResultId,
  onRefreshResult,
  onContinueEditing,
  onResetToOriginal,
  onClearHistory,
  isProcessing,
  errorMessage,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [processingStep, setProcessingStep] = useState<number>(1);

  // Step-by-step processing animation ticker
  useEffect(() => {
    if (!isProcessing) {
      setProcessingStep(1);
      return;
    }
    const interval = setInterval(() => {
      setProcessingStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const activeResult = results.find((r) => r.id === activeResultId) || results[0];

  const stepsList = [
    '1. 이미지 분석',
    '2. 얼굴 및 피사체 분석',
    '3. 편집 적용',
    '4. 품질 향상',
    '5. 결과 생성',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4 space-y-4 overflow-y-auto custom-scrollbar relative">
      {/* 1. Header with Top-Right Refresh Button `↻` */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">
            3
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide">RESULT</h2>
        </div>

        {/* Section 28: Top-Right Refresh Icon Button ↻ */}
        <button
          onClick={onRefreshResult}
          disabled={isProcessing}
          className={`p-2 rounded-xl border transition-all shadow-md flex items-center gap-1.5 ${
            isProcessing
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 cursor-wait'
              : 'bg-slate-900 border-slate-700 hover:border-indigo-500 text-slate-200 hover:text-indigo-300 active:scale-95'
          }`}
          title="같은 설정으로 다시 생성"
        >
          <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="text-xs font-bold hidden sm:inline">↻ 다시 생성</span>
        </button>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl flex items-center gap-2.5 text-rose-300 text-xs shrink-0 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-semibold leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Main Display Area */}
      <div className="flex-1 min-h-[380px] flex flex-col justify-center items-center">
        {isProcessing ? (
          /* Section 29: Processing Step-by-Step State Indicator */
          <div className="w-full h-full min-h-[380px] bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center space-y-5 text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <span className="text-3xl">📸</span>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-extrabold text-indigo-300 animate-pulse">
                AI가 이미지를 처리하고 있습니다…
              </p>
              <p className="text-xs text-slate-400">Identity Lock 원칙 적용 및 초고화질 보정 중</p>
            </div>

            {/* Steps Progress */}
            <div className="w-full max-w-xs space-y-1.5 pt-2">
              {stepsList.map((stepText, idx) => {
                const stepNum = idx + 1;
                const isDone = stepNum < processingStep;
                const isCurrent = stepNum === processingStep;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg transition-all ${
                      isCurrent
                        ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-200 font-bold'
                        : isDone
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-600'
                    }`}
                  >
                    <span>{stepText}</span>
                    <span>{isDone ? '✓' : isCurrent ? '⏳' : '·'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeResult ? (
          /* Active Result Display */
          <div className="w-full h-full flex flex-col space-y-3">
            <BeforeAfterViewer
              beforeDataUrl={activeResult.beforeDataUrl}
              afterDataUrl={activeResult.dataUrl}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            <DownloadControls
              result={activeResult}
              onRegenerate={onRefreshResult}
              onContinueEditing={onContinueEditing}
              onResetToOriginal={onResetToOriginal}
              isProcessing={isProcessing}
            />
          </div>
        ) : (
          /* Section 25: Empty State */
          <div className="w-full h-full min-h-[380px] bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
              📸
            </div>
            <div>
              <p className="text-sm font-bold text-slate-300">
                생성된 이미지가 여기에 표시됩니다.
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                왼쪽에서 사진을 올리고 중앙에서 원하는 편집 기능을 선택한 후 실행해주세요.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* History Stack Gallery */}
      {results.length > 0 && (
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              작업 히스토리 ({results.length}건)
            </span>
            <button
              onClick={onClearHistory}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>히스토리 삭제</span>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => setActiveResultId(res.id)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 transition-all ${
                  res.id === activeResult?.id
                    ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-105 shadow-md'
                    : 'border-slate-800 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={res.dataUrl} alt="History" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-indigo-300 font-semibold text-center py-0.5 truncate px-1">
                  {res.toolLabel}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
