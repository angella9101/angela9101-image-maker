import React from 'react';
import { ImageTool } from '../types';
import {
  Sparkles,
  Layers,
  RefreshCw,
  Maximize,
  Palette,
  Scissors,
  Image as ImageIcon,
  Eraser,
  Type,
  ShieldCheck,
  Award,
  Smile,
  Brush,
  Edit3,
  Calendar,
  Sparkle
} from 'lucide-react';

interface ToolSelectorProps {
  activeTool: ImageTool | null;
  onSelectTool: (tool: ImageTool) => void;
}

export interface ToolDef {
  id: ImageTool;
  label: string;
  category: '증명사진' | '인물' | '생성' | '복원' | '정밀 편집' | '크리에이티브';
  icon: any;
  desc: string;
}

export const TOOL_DEFINITIONS: ToolDef[] = [
  // 증명사진 도우미
  { id: 'PASSPORT_GUIDE', label: '여권사진 규격 가이드', category: '증명사진', icon: ShieldCheck, desc: '3.5x4.5 규격 촬영 구도 및 외교부 규격 확인' },

  // 인물
  { id: 'STUDIO', label: '스튜디오 사진', category: '인물', icon: Award, desc: '전문 사진관 프로필/화보 촬영' },
  { id: 'AGE_TRANSFORM', label: '인생앨범', category: '인물', icon: Calendar, desc: '목표 나이 연령 가상 변환' },

  // 생성
  { id: 'GENERATE', label: '이미지 생성', category: '생성', icon: Sparkles, desc: '텍스트 기반 AI 신규 인물/이미지 생성' },
  { id: 'COMPOSITE', label: '이미지 합성', category: '생성', icon: Layers, desc: '두 사진 개체 정밀 자연스러운 합성' },

  // 복원
  { id: 'RESTORE', label: '사진 복원', category: '복원', icon: RefreshCw, desc: '오래된 사진 찢김/먼지/얼룩 복원' },
  { id: 'UPSCALE', label: '업스케일', category: '복원', icon: Maximize, desc: '2x / 4x 초고해상도 디테일 향상' },
  { id: 'COLORIZE', label: '흑백사진 컬러화', category: '복원', icon: Palette, desc: '흑백 사진 생생한 인물/풍경 컬러화' },

  // 정밀 편집
  { id: 'BACKGROUND_REMOVE', label: '배경 제거', category: '정밀 편집', icon: Scissors, desc: '투명 배경 정밀 피사체 누끼 추출' },
  { id: 'BACKGROUND_REPLACE', label: '배경 교체', category: '정밀 편집', icon: ImageIcon, desc: '스튜디오/사무실/야외 배경 합성' },
  { id: 'OBJECT_REMOVE', label: '부분 삭제', category: '정밀 편집', icon: Eraser, desc: '마스크 영역 지우기 AI Inpaint' },
  { id: 'SKIN_RETOUCH', label: '피부 보정', category: '정밀 편집', icon: Smile, desc: '여드름/트러블 보정 (이목구비 보존)' },

  // 크리에이티브
  { id: 'STYLE_TRANSFER', label: '스타일 변환', category: '크리에이티브', icon: Brush, desc: '수채화/유화/3D 캐릭터 화풍 변환' },
  { id: 'SKETCH', label: '스케치 변환', category: '크리에이티브', icon: Edit3, desc: '연필 스케치 & 윤곽 선화 변환' },
  { id: 'SKETCH_COLOR', label: '스케치 배색', category: '크리에이티브', icon: Sparkle, desc: '스케치 도안에 컬러 색입히기' },
  { id: 'POSTER', label: '포스터·텍스트', category: '크리에이티브', icon: Type, desc: '스타일리시한 포스터 타이포그래피' },
];

export const ToolSelector: React.FC<ToolSelectorProps> = ({ activeTool, onSelectTool }) => {
  const categories: ToolDef['category'][] = ['증명사진', '인물', '생성', '복원', '정밀 편집', '크리에이티브'];

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const catTools = TOOL_DEFINITIONS.filter((t) => t.category === cat);
        return (
          <div key={cat} className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 px-1">{cat}</span>
            <div className="grid grid-cols-2 gap-1.5">
              {catTools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10 font-bold ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-tight truncate">{tool.label}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{tool.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
