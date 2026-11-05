export type RemoverToolMode = 'brush' | 'rectangle';

export interface InpaintOptions {
  radius?: number;
  iterations?: number;
}

export interface InpaintHistoryStep {
  imageData: ImageData;
  label: string;
}
