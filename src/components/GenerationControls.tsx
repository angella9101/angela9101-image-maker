import React from 'react';
import { ControlOptions } from '../types';
import { Sparkles, Layers, ImageIcon, Type, Smile, Brush, Edit3 } from 'lucide-react';

interface GenerationControlsProps {
  options: ControlOptions;
  setOptions: React.Dispatch<React.SetStateAction<ControlOptions>>;
}

export const GenerationControls: React.FC<GenerationControlsProps> = ({ options, setOptions }) => {
  const updateOption = <K extends keyof ControlOptions>(key: K, value: ControlOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const updatePoster = <K extends keyof ControlOptions['posterLayer']>(
    key: K,
    value: NonNullable<ControlOptions['posterLayer']>[K]
  ) => {
    setOptions((prev) => ({
      ...prev,
      posterLayer: {
        body: '',
        brand: 'STUDIO',
        renderInImage: false,
        ...prev.posterLayer,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
      {/* 1. Image Generation */}
      {options.activeTool === 'GENERATE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              이미지 생성 스타일 & 구도
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">생성 스타일:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'photorealistic', label: '사실적 포토' },
                { id: 'cinematic', label: '시네마틱' },
                { id: 'editorial', label: '에디토리얼 화보' },
                { id: 'artistic', label: '아티스틱' },
                { id: 'minimalist', label: '미니멀리스트' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateOption('genStyle', st.id as any)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                    options.genStyle === st.id
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Image Compositing */}
      {options.activeTool === 'COMPOSITE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              이미지 합성 위치 & 크기 제어
            </span>
            <span className="text-[10px] text-slate-400">광원 · 원근감 · 그림자 자동 일치</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">배치 위치 선택:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'auto', label: '자동 배치' },
                { id: 'left', label: '왼쪽' },
                { id: 'center', label: '가운데' },
                { id: 'right', label: '오른쪽' },
                { id: 'foreground', label: '전경' },
                { id: 'background', label: '배경' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => updateOption('synthesisPosition', pos.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                    options.synthesisPosition === pos.id
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex justify-between text-slate-300">
              <span>합성 개체 크기:</span>
              <span className="font-bold text-indigo-300">{options.synthesisScale || 100}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="180"
              value={options.synthesisScale || 100}
              onChange={(e) => updateOption('synthesisScale', Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3. Background Replacement */}
      {options.activeTool === 'BACKGROUND_REPLACE' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              배경 교체 프리셋
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'white', label: '흰색' },
              { id: 'light_gray', label: '연회색' },
              { id: 'beige', label: '베이지' },
              { id: 'blue', label: '블루' },
              { id: 'studio', label: '스튜디오' },
              { id: 'office', label: '사무실' },
              { id: 'outdoor', label: '자연' },
              { id: 'custom', label: '직접 입력' },
            ].map((bg) => (
              <button
                key={bg.id}
                onClick={() => updateOption('bgReplaceType', bg.id as any)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  options.bgReplaceType === bg.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>

          {options.bgReplaceType === 'custom' && (
            <input
              type="text"
              value={options.customBgPrompt || ''}
              onChange={(e) => updateOption('customBgPrompt', e.target.value)}
              placeholder="원하는 배경 입력 (예: 노을 지는 해변 카페 테라스)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          )}
        </div>
      )}

      {/* 4. Skin Retouch */}
      {options.activeTool === 'SKIN_RETOUCH' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Smile className="w-4 h-4 text-indigo-400" />
              피부 보정 강도 설정
            </span>
            <span className="text-[10px] text-slate-400">여드름 · 잡티 제거 (이목구비 보존)</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'natural', label: '자연스럽게 (기본)' },
              { id: 'normal', label: '보통' },
              { id: 'strong', label: '강하게' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => updateOption('skinRetouchIntensity', st.id as any)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  options.skinRetouchIntensity === st.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Style Transfer */}
      {options.activeTool === 'STYLE_TRANSFER' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Brush className="w-4 h-4 text-indigo-400" />
              스타일 변환 화풍
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'realistic', label: '실사' },
              { id: 'watercolor', label: '수채화' },
              { id: 'oil_painting', label: '유화' },
              { id: 'pencil', label: '연필화' },
              { id: 'illustration', label: '일러스트' },
              { id: 'character_3d', label: '3D 캐릭터' },
              { id: 'anime', label: '애니메이션' },
              { id: 'vintage', label: '빈티지' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => updateOption('styleType', st.id as any)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  options.styleType === st.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Sketch & Color */}
      {(options.activeTool === 'SKETCH' || options.activeTool === 'SKETCH_COLOR') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-indigo-400" />
              스케치 모드 선택
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'photo_to_line', label: '사진 → 선화' },
              { id: 'photo_to_sketch', label: '사진 → 연필 스케치' },
              { id: 'coloring_page', label: '사진 → 컬러링 도안' },
              { id: 'sketch_to_color', label: '스케치 → 컬러 이미지' },
            ].map((sk) => (
              <button
                key={sk.id}
                onClick={() => updateOption('sketchMode', sk.id as any)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  options.sketchMode === sk.id
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {sk.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Poster & Text Design */}
      {options.activeTool === 'POSTER' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-400" />
              포스터 · 텍스트 레이어 설정
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <input
              type="text"
              value={options.posterLayer?.title || ''}
              onChange={(e) => updatePoster('title', e.target.value)}
              placeholder="제목 (Title)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 font-bold text-white focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={options.posterLayer?.subtitle || ''}
              onChange={(e) => updatePoster('subtitle', e.target.value)}
              placeholder="부제 (Subtitle)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={options.posterLayer?.brand || ''}
              onChange={(e) => updatePoster('brand', e.target.value)}
              placeholder="브랜드명 (Brand)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="renderInImg"
                checked={options.posterLayer?.renderInImage || false}
                onChange={(e) => updatePoster('renderInImage', e.target.checked)}
                className="accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="renderInImg" className="text-slate-300 font-semibold cursor-pointer text-[11px]">
                이미지에 텍스트 포함하여 생성 (AI 렌더링)
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
