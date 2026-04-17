
export interface SampleSignature {
  id: string;
  employeeId: number; // Added to scope signatures per employee
  name: string;
  imageUrl: string; // Base64 PNG
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  watermarkConfig: 'both' | 'image_only' | 'info_only';
}

export const SIGNATURE_COLORS = [
  { name: 'Đen', value: '#000000' },
  { name: 'Đỏ', value: '#FF0000' },
  { name: 'Xanh dương', value: '#0000FF' },
  { name: 'Xanh lá', value: '#008000' },
];

export const ART_FONTS = [
  { name: 'Nét thanh', value: "'Alex Brush', cursive" },
  { name: 'Viết tay', value: "'Dancing Script', cursive" },
  { name: 'Nghệ thuật', value: "'Great Vibes', cursive" },
  { name: 'Mềm mại', value: "'Allura', cursive" },
];

export interface CanvasObject {
  id: string;
  type: 'scribble' | 'text' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  content?: string; // Text content or Image dataUrl
  color?: string;
  fontFamily?: string;
  points?: { x: number; y: number }[]; // For scribble
}
