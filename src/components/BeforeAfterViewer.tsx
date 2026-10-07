import React, { useState } from 'react';
import { ViewMode } from '../types';
import { Eye, ArrowRightLeft, Columns, Sliders } from 'lucide-react';

interface BeforeAfterViewerProps {
  beforeDataUrl?: string;
  afterDataUrl: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const BeforeAfterViewer: React.FC<BeforeAfterViewerProps> = ({
  beforeDataUrl,
  afterDataUrl,
  viewMode,
  setViewMode,
}) => {
  const [sliderPos, setSliderPos] = useState<number>(50);

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Top View Mode Switcher Tabs */}
      <div className="flex items-center justify-between bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs shrink-0 mb-2">
        <div className="flex items-center gap-1">
          {beforeDataUrl && (
            <>
              <button
                onClick={() => setViewMode('slider')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'slider'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>슬라이더 비교</span>
              </button>

              <button
                onClick={() => setViewMode('side_by_side')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'side_by_side'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>좌우 비교</span>
              </button>

              <button
                onClick={() => setViewMode('before')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'before'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Before (원본)</span>
              </button>
            </>
          )}

          <button
            onClick={() => setViewMode('after')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              viewMode === 'after' || !beforeDataUrl
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>After (결과)</span>
          </button>
        </div>
      </div>

      {/* Main Image Rendering Canvas Frame */}
      <div className="flex-1 min-h-[360px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center p-2">
        {/* Mode: Interactive Split Slider */}
        {viewMode === 'slider' && beforeDataUrl && (
          <div className="relative w-full h-full min-h-[340px] select-none overflow-hidden flex items-center justify-center">
            {/* Before Layer (Left) */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
              <img
                src={beforeDataUrl}
                alt="Before"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                BEFORE (원본)
              </span>
            </div>

            {/* After Layer (Right Clipped) */}
            <div
              className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center"
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
              <img
                src={afterDataUrl}
                alt="After"
                className="max-h-full max-w-full object-contain"
              />
              <span className="absolute top-3 right-3 bg-indigo-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md">
                AFTER (결과)
              </span>
            </div>

            {/* Handle Drag Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-indigo-400 shadow-xl cursor-ew-resize z-20 flex items-center justify-center"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-6 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xl border border-white/40">
                ↔
              </div>
            </div>

            {/* Range Input Overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
            />
          </div>
        )}

        {/* Mode: Side-by-Side */}
        {viewMode === 'side_by_side' && beforeDataUrl && (
          <div className="grid grid-cols-2 gap-2 w-full h-full min-h-[340px]">
            <div className="relative bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
              <img src={beforeDataUrl} alt="Before" className="max-h-full max-w-full object-contain" />
              <span className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-md">
                BEFORE
              </span>
            </div>
            <div className="relative bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
              <img src={afterDataUrl} alt="After" className="max-h-full max-w-full object-contain" />
              <span className="absolute top-3 right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                AFTER
              </span>
            </div>
          </div>
        )}

        {/* Mode: Before Only */}
        {viewMode === 'before' && beforeDataUrl && (
          <div className="relative w-full h-full min-h-[340px] flex items-center justify-center">
            <img src={beforeDataUrl} alt="Before Only" className="max-h-full max-w-full object-contain" />
            <span className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-md">
              BEFORE (원본 이미지)
            </span>
          </div>
        )}

        {/* Mode: After Only */}
        {(viewMode === 'after' || !beforeDataUrl) && (
          <div className="relative w-full h-full min-h-[340px] flex items-center justify-center">
            <img src={afterDataUrl} alt="After Only" className="max-h-full max-w-full object-contain" />
            <span className="absolute top-3 right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md">
              AI 사진스튜디오 결과
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
