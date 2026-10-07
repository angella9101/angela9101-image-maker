export type ImageTool =
  | 'GENERATE'
  | 'COMPOSITE'
  | 'RESTORE'
  | 'UPSCALE'
  | 'COLORIZE'
  | 'BACKGROUND_REMOVE'
  | 'BACKGROUND_REPLACE'
  | 'OBJECT_REMOVE'
  | 'SKIN_RETOUCH'
  | 'STYLE_TRANSFER'
  | 'SKETCH'
  | 'SKETCH_COLOR'
  | 'POSTER'
  | 'STUDIO'
  | 'AGE_TRANSFORM'
  | 'PASSPORT_GUIDE';

export type ToolType = ImageTool;

export type ImageRole = 'SOURCE' | 'REFERENCE' | 'COMPOSITE';

export interface UploadedImage {
  id: string;
  dataUrl: string;
  name: string;
  role: ImageRole;
  width?: number;
  height?: number;
  size?: number;
}

export interface ImageTaskRequest {
  tool: ImageTool;
  userPrompt?: string;
  sourceImages?: {
    role: ImageRole;
    mimeType: string;
    base64: string;
  }[];
  identityLock?: boolean;
  aspectRatio?: string;
  quality?: '1K' | '2K' | '4K';
  outputCount?: number;
  options?: Record<string, unknown>;
}

export interface ResultImage {
  id: string;
  dataUrl: string;
  beforeDataUrl?: string;
  timestamp: string;
  tool: ImageTool;
  toolLabel: string;
  prompt: string;
  aspectRatio: string;
  quality?: string;
}

export type GeneratedResult = ResultImage;

export type ViewMode = 'before' | 'after' | 'side_by_side' | 'slider';

export interface PosterTextLayer {
  title: string;
  subtitle: string;
  body?: string;
  brand?: string;
  stylePreset?: string;
  fontFamily?: string;
  fontSize?: number;
  position?: string;
  align?: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  opacity?: number;
  color?: string;
  renderInImage?: boolean;
}

export interface ControlOptions {
  activeTool: ImageTool;
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  count: number;
  quality: '1K' | '2K' | '4K';
  identityLock: boolean;

  // Tool specific options
  genStyle?: 'photorealistic' | 'cinematic' | 'editorial' | 'artistic' | 'minimalist';
  genComposition?: string;

  synthesisPosition?: 'auto' | 'left' | 'center' | 'right' | 'foreground' | 'background';
  synthesisScale?: number;
  synthesisPosX?: number;
  synthesisPosY?: number;
  synthesisAutoPosition?: boolean;

  restoreIntensity?: 'light' | 'normal' | 'strong';
  upscaleFactor?: '2x' | '4x';
  colorizeTone?: 'natural' | 'warm' | 'vibrant';

  bgReplaceType?: 'white' | 'light_gray' | 'beige' | 'blue' | 'studio' | 'office' | 'outdoor' | 'custom';
  customBgPrompt?: string;

  posterLayer: PosterTextLayer;

  passportBg?: 'white' | 'light_gray' | 'light_blue';
  passportAttire?: 'suit' | 'formal' | 'original';

  studioPreset?: 'profile' | 'business' | 'job_hunting' | 'classic' | 'natural_light' | 'bright_studio' | 'luxury_studio';
  studioFraming?: 'bust' | 'full_body' | 'portrait';

  skinRetouchIntensity?: 'natural' | 'normal' | 'strong';
  styleType?: 'realistic' | 'watercolor' | 'oil_painting' | 'pencil' | 'illustration' | 'character_3d' | 'anime' | 'vintage';
  stylePreset?: string;
  sketchMode?: 'photo_to_line' | 'photo_to_sketch' | 'coloring_page' | 'sketch_to_color';

  currentAge?: number;
  targetAge?: number;

  maskDataUrl?: string;
}

export interface AppState extends ControlOptions {
  uploadedImages: UploadedImage[];
  selectedTool: ImageTool | null;
  userPrompt: string;
  enhancedPrompt: string;
  outputCount: 1 | 2 | 3 | 4;
  activeImageId: string | null;
  resultImages: ResultImage[];
  isProcessing: boolean;
  error?: string;
}
