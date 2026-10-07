import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { PromptInput } from './components/PromptInput';
import { PromptGenerator } from './components/PromptGenerator';
import { ToolSelector, TOOL_DEFINITIONS } from './components/ToolSelector';
import { GenerationControls } from './components/GenerationControls';
import { RestorationControls } from './components/RestorationControls';
import { PassportPhotoControls } from './components/PassportPhotoControls';
import { StudioPhotoControls } from './components/StudioPhotoControls';
import { AgeTransformationControls } from './components/AgeTransformationControls';
import { MaskEditor } from './components/MaskEditor';
import { ResultViewer } from './components/ResultViewer';
import { ControlOptions, GeneratedResult, ImageTool, ImageTaskRequest, UploadedImage } from './types';
import { generateSampleImages } from './data/sampleImages';
import { safelyRunImageTask } from './services/apiRouter';
import { processCanvasImage } from './utils/canvasProcessor';
import { RefreshCw, Sparkles, Sliders, ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [idea, setIdea] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [lastTask, setLastTask] = useState<ImageTaskRequest | null>(null);

  const [options, setOptions] = useState<ControlOptions>({
    activeTool: 'PASSPORT_GUIDE',
    prompt: '',
    aspectRatio: '3:4',
    count: 1,
    quality: '1K',
    identityLock: true,

    genStyle: 'photorealistic',
    genComposition: 'center',

    synthesisPosX: 0,
    synthesisPosY: 0,
    synthesisScale: 100,
    synthesisAutoPosition: true,

    restoreIntensity: 'normal',
    upscaleFactor: '4x',
    colorizeTone: 'natural',

    bgReplaceType: 'studio',
    customBgPrompt: '',

    posterLayer: {
      title: 'AI PHOTO STUDIO',
      subtitle: 'PROFESSIONAL PORTRAIT',
      body: '',
      brand: 'AI STUDIO',
      stylePreset: 'modern',
      fontFamily: 'sans-serif',
      fontSize: 36,
      position: 'bottom',
      align: 'center',
      letterSpacing: 2,
      lineHeight: 1.2,
      opacity: 0.9,
      color: '#FFFFFF',
      renderInImage: false,
    },

    passportBg: 'white',
    passportAttire: 'suit',

    studioPreset: 'profile',
    studioFraming: 'bust',

    skinRetouchIntensity: 'natural',
    styleType: 'watercolor',
    sketchMode: 'photo_to_line',

    currentAge: 20,
    targetAge: 50,
  });

  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);

  // Load initial samples and pre-generate initial result on mount
  useEffect(() => {
    const defaultSamples = generateSampleImages();
    setImages(defaultSamples);
    const mainSample = defaultSamples[0];
    setActiveImageId(mainSample?.id || null);

    if (mainSample) {
      processCanvasImage(defaultSamples, { ...options, activeTool: 'PASSPORT_GUIDE' }).then((passportUrl) => {
        const initResult: GeneratedResult = {
          id: 'res_init_passport',
          dataUrl: passportUrl,
          beforeDataUrl: mainSample.dataUrl,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          tool: 'PASSPORT_GUIDE',
          toolLabel: '여권사진 규격 가이드',
          prompt: '대한민국 규격 여권사진 (3.5x4.5cm 무늬 없는 단색 배경)',
          aspectRatio: '3:4',
        };
        setResults([initResult]);
        setActiveResultId(initResult.id);
      });
    }
  }, []);

  // Sync prompt when user updates prompt
  useEffect(() => {
    if (prompt) {
      setOptions((prev) => ({ ...prev, prompt }));
    }
  }, [prompt]);

  // AI Prompt Auto Generator Handler (Section 23)
  const handleGeneratePrompt = async () => {
    if (!idea.trim()) return;
    setIsGeneratingPrompt(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/nano-banana/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, tool: options.activeTool }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error('Enhance prompt failed:', err);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // Main Execution Handler (Sections 3, 24, 26)
  const handleExecuteTask = async (taskToRun?: ImageTaskRequest) => {
    const mainImage =
      images.find((img) => img.id === activeImageId) ||
      images.find((img) => img.role === 'SOURCE') ||
      images[0];

    const sourceImagesPayload = images.map((img) => ({
      role: img.role,
      mimeType: img.dataUrl.match(/^data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/png',
      base64: img.dataUrl.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
    }));

    const task: ImageTaskRequest = taskToRun || {
      tool: options.activeTool,
      userPrompt: prompt || idea,
      sourceImages: sourceImagesPayload,
      identityLock: options.identityLock,
      aspectRatio: options.aspectRatio,
      quality: options.quality,
      outputCount: options.count,
      options: { ...options },
    };

    setLastTask(task);

    await safelyRunImageTask(
      task,
      setIsProcessing,
      setErrorMessage,
      (generatedUrls) => {
        const activeToolDef = TOOL_DEFINITIONS.find((t) => t.id === task.tool);
        const generatedResults: GeneratedResult[] = generatedUrls.map((url, i) => ({
          id: `res_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
          dataUrl: url,
          beforeDataUrl: mainImage ? mainImage.dataUrl : undefined,
          timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          tool: task.tool,
          toolLabel: activeToolDef?.label || '편집',
          prompt: task.userPrompt || 'AI 스튜디오 정밀 편집',
          aspectRatio: task.aspectRatio || '1:1',
        }));

        setResults((prev) => [...generatedResults, ...prev]);
        if (generatedResults.length > 0) {
          setActiveResultId(generatedResults[0].id);
        }
      }
    );
  };

  // Tool Selection Switcher
  const handleSelectTool = (tool: ImageTool) => {
    setOptions((prev) => {
      const next = { ...prev, activeTool: tool };
      if (tool === 'PASSPORT_GUIDE') {
        next.aspectRatio = '3:4';
      }
      return next;
    });
  };

  // Reset Confirmation Handler
  const handleConfirmReset = () => {
    setIdea('');
    setPrompt('');
    setImages([]);
    setActiveImageId(null);
    setResults([]);
    setActiveResultId(null);
    setErrorMessage(null);
    setShowResetModal(false);
  };

  // Continue Editing Handler (Section 22)
  const handleContinueEditing = (dataUrl: string) => {
    const newImg: UploadedImage = {
      id: `img_${Date.now()}`,
      dataUrl,
      name: '편집결과_재가공.png',
      role: 'SOURCE',
    };
    setImages((prev) => [newImg, ...prev.filter((i) => i.role !== 'SOURCE')]);
    setActiveImageId(newImg.id);
    setIdea('현재 결과를 기준으로 어떤 부분을 더 수정할까요?');
  };

  // Reset to Original
  const handleResetToOriginal = () => {
    const samples = generateSampleImages();
    setImages(samples);
    setActiveImageId(samples[0]?.id || null);
  };

  const activeToolDef = TOOL_DEFINITIONS.find((t) => t.id === options.activeTool);
  const activeMainImage = images.find((i) => i.id === activeImageId) || images[0];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* App Header */}
      <Header
        onLoadSamples={handleResetToOriginal}
        onResetAll={() => setShowResetModal(true)}
        activeTaskName={activeToolDef?.label || '편집'}
      />

      {/* Main 3-Panel Layout (Left 25%, Center 30%, Right 45%) */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
        {/* Left Panel: INPUT (~25% width / col-span-3) */}
        <section className="md:col-span-3 h-full min-h-0 overflow-y-auto custom-scrollbar p-3.5 space-y-4 bg-slate-900/90">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h2 className="text-xs font-black text-indigo-400 tracking-wider">INPUT</h2>
            <span className="text-[10px] text-slate-400">이미지 & 아이디어</span>
          </div>

          <ImageUploader
            images={images}
            setImages={setImages}
            activeImageId={activeImageId}
            setActiveImageId={setActiveImageId}
          />

          <PromptInput
            idea={idea}
            setIdea={setIdea}
            onClear={() => {
              setIdea('');
              setPrompt('');
            }}
          />

          <PromptGenerator
            idea={idea}
            prompt={prompt}
            setPrompt={setPrompt}
            onGeneratePrompt={handleGeneratePrompt}
            isGenerating={isGeneratingPrompt}
          />
        </section>

        {/* Center Panel: EDIT & CREATE (~30% width / col-span-4) */}
        <section className="md:col-span-4 h-full min-h-0 overflow-y-auto custom-scrollbar p-3.5 space-y-4 bg-slate-900/95">
          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
            <h2 className="text-xs font-black text-indigo-400 tracking-wider">EDIT & CREATE</h2>
            <button
              onClick={() => setShowResetModal(true)}
              className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
            >
              초기화
            </button>
          </div>

          <ToolSelector activeTool={options.activeTool} onSelectTool={handleSelectTool} />

          {/* Dynamic Tool Controls */}
          {options.activeTool === 'PASSPORT_GUIDE' && (
            <PassportPhotoControls options={options} setOptions={setOptions} />
          )}

          {options.activeTool === 'STUDIO' && (
            <StudioPhotoControls options={options} setOptions={setOptions} />
          )}

          {options.activeTool === 'AGE_TRANSFORM' && (
            <AgeTransformationControls options={options} setOptions={setOptions} />
          )}

          {(options.activeTool === 'RESTORE' || options.activeTool === 'UPSCALE' || options.activeTool === 'COLORIZE') && (
            <RestorationControls options={options} setOptions={setOptions} />
          )}

          {options.activeTool === 'OBJECT_REMOVE' && activeMainImage && (
            <MaskEditor
              sourceDataUrl={activeMainImage.dataUrl}
              onMaskChange={(maskUrl) => setOptions((prev) => ({ ...prev, maskDataUrl: maskUrl }))}
            />
          )}

          {(options.activeTool === 'GENERATE' ||
            options.activeTool === 'COMPOSITE' ||
            options.activeTool === 'BACKGROUND_REPLACE' ||
            options.activeTool === 'SKIN_RETOUCH' ||
            options.activeTool === 'STYLE_TRANSFER' ||
            options.activeTool === 'SKETCH' ||
            options.activeTool === 'SKETCH_COLOR' ||
            options.activeTool === 'POSTER' ||
            options.activeTool === 'BACKGROUND_REMOVE') && (
            <GenerationControls options={options} setOptions={setOptions} />
          )}

          {/* Common Bottom Generation Options */}
          <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                공통 출력 옵션
              </span>

              {/* Identity Lock Toggle */}
              <button
                onClick={() => setOptions((prev) => ({ ...prev, identityLock: !prev.identityLock }))}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                  options.identityLock
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500'
                }`}
                title="얼굴 이목구비, 피부톤, 체형 정체성을 100% 보존합니다."
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Identity Lock: {options.identityLock ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">비율 (Aspect Ratio):</label>
              <div className="grid grid-cols-5 gap-1">
                {(['1:1', '16:9', '9:16', '4:3', '3:4'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setOptions((prev) => ({ ...prev, aspectRatio: ratio }))}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      options.aspectRatio === ratio
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div className="space-y-1">
              <label className="text-xs text-slate-400">생성 장수 (Count):</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setOptions((prev) => ({ ...prev, count: cnt }))}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      options.count === cnt
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {cnt}장
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Execute Button */}
          <div className="pt-1">
            <button
              onClick={() => handleExecuteTask()}
              disabled={isProcessing}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                isProcessing
                  ? 'bg-indigo-500/30 text-indigo-200 cursor-wait border border-indigo-500/50'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/20 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-300" />
                  <span>AI 스튜디오 편집 실행 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>🚀 AI 실행 (Generate / Edit)</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Panel: RESULT (~45% width / col-span-5) */}
        <section className="md:col-span-5 h-full min-h-0 overflow-hidden bg-slate-950">
          <ResultViewer
            results={results}
            activeResultId={activeResultId}
            setActiveResultId={setActiveResultId}
            onRefreshResult={() => (lastTask ? handleExecuteTask(lastTask) : handleExecuteTask())}
            onContinueEditing={handleContinueEditing}
            onResetToOriginal={handleResetToOriginal}
            onClearHistory={() => setResults([])}
            isProcessing={isProcessing}
            errorMessage={errorMessage}
          />
        </section>
      </main>

      {/* Reset Confirmation Modal Popup */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-sm text-white">초기화 확인</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              “현재 이미지와 설정을 모두 초기화하시겠습니까?”
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
