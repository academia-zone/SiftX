export interface DetectedElement {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataUrl: string; // Transparent PNG data URL of this isolated element
  visible: boolean;
  opacity: number;
  rotation?: number;
  category: 'icon' | 'badge' | 'shape' | 'text' | 'object';
  customImage?: string; // If user replaced this element with their own image
}

export interface AddedElement {
  id: string;
  type: 'shape' | 'text' | 'social-icon';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
  fontSize?: number;
  iconName?: 'facebook' | 'whatsapp' | 'linkedin' | 'star' | 'heart' | 'arrow';
}

export interface SegmentationOptions {
  sensitivity?: number; // 10 to 60 (threshold for contour/color boundary)
  minArea?: number;      // Minimum bounding box area in pixels to ignore tiny specks
  maxArea?: number;
}
