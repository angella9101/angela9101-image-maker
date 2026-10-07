import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Undo, Redo, RefreshCw, Sliders } from 'lucide-react';

interface MaskEditorProps {
  sourceDataUrl: string;
  onMaskChange: (maskDataUrl: string | undefined) => void;
}

export const MaskEditor: React.FC<MaskEditorProps> = ({ sourceDataUrl, onMaskChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDragging] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Load Image and Init Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceDataUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 800;

      ctx.drawImage(img, 0, 0);
      saveState(ctx, canvas);
    };
    img.src = sourceDataUrl;
  }, [sourceDataUrl]);

  const saveState = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const nextHistory = prev.slice(0, historyStep + 1);
      return [...nextHistory, state];
    });
    setHistoryStep((prev) => prev + 1);
    onMaskChange(canvas.toDataURL('image/png'));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDragging(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) saveState(ctx, canvas);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.save();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.65)'; // Translucent red brush mask
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const nextStep = historyStep - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
    onMaskChange(canvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const nextStep = historyStep + 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
    onMaskChange(canvas.toDataURL('image/png'));
  };

  const handleResetMask = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(history[0], 0, 0);
    setHistory([history[0]]);
    setHistoryStep(0);
    onMaskChange(undefined);
  };

  return (
    <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <Eraser className="w-4 h-4 text-indigo-400" />
          부분 삭제 브러시 마스크 에디터
        </span>
        <span className="text-[10px] text-slate-400">삭제할 영역을 칠해주세요</span>
      </div>

      {/* Canvas Interactive Brush Area */}
      <div className="relative w-full max-h-[280px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          className="max-h-[280px] w-auto object-contain cursor-crosshair"
        />
      </div>

      {/* Controls: Brush Size, Undo, Redo, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <span className="text-slate-400 shrink-0 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> 크기: {brushSize}px
          </span>
          <input
            type="range"
            min="5"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            title="실행 취소 (Undo)"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg border border-slate-800 transition-colors"
            title="다시 실행 (Redo)"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetMask}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 text-[11px] font-semibold rounded-lg border border-slate-800 flex items-center gap-1 transition-colors"
            title="마스크 초기화"
          >
            <RefreshCw className="w-3 h-3" />
            <span>초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
};
