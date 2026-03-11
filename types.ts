export interface AdStyle {
  id: string;
  name: string;
  promptModifier: string;
  icon: string;
}

export interface GeneratedImage {
  id: string;
  originalImage: string;
  generatedImageUrl: string | null;
  prompt: string;
  timestamp: number;
}

export enum AspectRatio {
  SQUARE = "1:1",
  PORTRAIT = "9:16",
  LANDSCAPE = "16:9"
}

export type CameraAngle = 'low' | 'front' | 'high';

export type BrandType = 'matezz' | 'laava';

export interface GenerationConfig {
  style: AdStyle;
  customPrompt: string;
  aspectRatio: AspectRatio;
  cameraAngle?: CameraAngle;
}