import React, { useState } from 'react';
import { ControlOptions } from '../types';
import { AlertTriangle, ShieldCheck, Ruler, CheckCircle, HelpCircle, Shirt } from 'lucide-react';

interface PassportPhotoControlsProps {
  options: ControlOptions;
  setOptions: React.Dispatch<React.SetStateAction<ControlOptions>>;
}

export const PassportPhotoControls: React.FC<PassportPhotoControlsProps> = ({ options, setOptions }) => {
  const [showGuideModal, setShowGuideModal] = useState(false);

  const updateOption = <K extends keyof ControlOptions>(key: K, value: ControlOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          여권사진 규격 설정
        </span>
        <span className="text-[10px] font-semibold text-amber-400">외교부 3.5x4.5 규격</span>
      </div>

      {/* Prominent Legal Disclaimer Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-start gap-2 text-amber-200 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11px] space-y-0.5">
          <p className="font-bold text-amber-300">
            대한민국 여권 제출용 사진은 과도한 성형 보정이 금지되어 있습니다.
          </p>
          <p className="text-slate-300">
            이 기능은 Identity Lock 원칙으로 얼굴 이목구비를 100% 보존하며 단색 배경 및 구도를 정밀 보정합니다.
          </p>
        </div>
      </div>

      {/* Background Options */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">규격 배경 색상 선택:</label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'white', label: '무늬 없는 흰색' },
            { id: 'light_gray', label: '밝은 회색' },
            { id: 'light_blue', label: '연파란색' },
          ].map((bg) => (
            <button
              key={bg.id}
              onClick={() => updateOption('passportBg', bg.id as any)}
              className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all ${
                options.passportBg === bg.id
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {bg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attire Option */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Shirt className="w-3.5 h-3.5 text-indigo-400" />
          가상 의상 보정:
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'suit', label: '포멀 정장' },
            { id: 'formal', label: '드레스 셔츠' },
            { id: 'original', label: '원본 의상 유지' },
          ].map((att) => (
            <button
              key={att.id}
              onClick={() => updateOption('passportAttire', att.id as any)}
              className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                options.passportAttire === att.id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {att.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reference Dimensions Info */}
      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-indigo-300">
          <Ruler className="w-3.5 h-3.5" />
          <span>외교부 여권사진 규격 치수:</span>
        </div>
        <ul className="text-[11px] text-slate-300 space-y-1 pl-1">
          <li className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>실물 인화 크기: <strong>3.5 cm × 4.5 cm (3:4)</strong></span>
          </li>
          <li className="flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>온라인 권장 해상도: <strong>413 × 531 px 이상</strong></span>
          </li>
        </ul>
      </div>

      <div className="pt-1">
        <button
          onClick={() => setShowGuideModal(true)}
          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
          <span>외교부 여권사진 정석 촬영 가이드 보기</span>
        </button>
      </div>

      {/* Guide Modal */}
      {showGuideModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl max-w-md w-full space-y-3 shadow-2xl text-xs text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-sm text-indigo-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              외교부 여권사진 정석 촬영 가이드
            </h3>
            <ul className="space-y-1.5 text-slate-300 leading-relaxed text-[11px] list-disc pl-4">
              <li>정면을 바라보고 양쪽 눈과 귀가 명확히 보여야 합니다.</li>
              <li>배경은 균일한 흰색이어야 하며 그림자가 없어야 합니다.</li>
              <li>흰색 옷은 배경과 구분이 안 되므로 착용을 금합니다.</li>
              <li>모자, 썬글라스, 색천 안경 착용은 불가능합니다.</li>
              <li>입은 다물고 중립적인 무표정을 유지해야 합니다.</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold text-xs"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
