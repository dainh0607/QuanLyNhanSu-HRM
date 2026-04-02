const WEBP_MIME_TYPE = "image/webp";
const LARGE_FILE_THRESHOLD_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const DEFAULT_TARGET_SIZE_BYTES = 260 * 1024;
const LARGE_FILE_TARGET_SIZE_BYTES = 180 * 1024;
const DEFAULT_MAX_DIMENSION = 512;
const LARGE_FILE_MAX_DIMENSION = 384;
const MIN_DIMENSION = 160;
const INITIAL_QUALITY = 0.86;
const MIN_QUALITY = 0.5;
const QUALITY_STEP = 0.08;
const MAX_ATTEMPTS = 6;

export const AVATAR_LARGE_FILE_THRESHOLD_BYTES = LARGE_FILE_THRESHOLD_BYTES;
export const MAX_AVATAR_SOURCE_FILE_SIZE_BYTES = MAX_SOURCE_FILE_SIZE_BYTES;

interface CanvasDimensions {
  width: number;
  height: number;
}

export interface OptimizedAvatarResult {
  dataUrl: string;
  sizeInBytes: number;
  width: number;
  height: number;
}

const loadImageElement = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Không thể đọc ảnh đã chọn."));
    };

    image.src = objectUrl;
  });

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string" && result.trim()) {
        resolve(result);
        return;
      }

      reject(new Error("Không thể chuyển đổi ảnh đại diện."));
    };

    reader.onerror = () => reject(new Error("Không thể chuyển đổi ảnh đại diện."));
    reader.readAsDataURL(blob);
  });

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Không thể tối ưu ảnh đại diện."));
      },
      mimeType,
      quality,
    );
  });

const getCanvasDimensions = (
  sourceWidth: number,
  sourceHeight: number,
  maxDimension: number,
): CanvasDimensions => {
  if (sourceWidth <= maxDimension && sourceHeight <= maxDimension) {
    return {
      width: sourceWidth,
      height: sourceHeight,
    };
  }

  if (sourceWidth >= sourceHeight) {
    const ratio = maxDimension / sourceWidth;
    return {
      width: maxDimension,
      height: Math.max(1, Math.round(sourceHeight * ratio)),
    };
  }

  const ratio = maxDimension / sourceHeight;
  return {
    width: Math.max(1, Math.round(sourceWidth * ratio)),
    height: maxDimension,
  };
};

const renderImageToCanvas = (
  image: HTMLImageElement,
  maxDimension: number,
): { canvas: HTMLCanvasElement; width: number; height: number } => {
  const { width, height } = getCanvasDimensions(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    maxDimension,
  );

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Không thể xử lý ảnh đại diện.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return { canvas, width, height };
};

export const optimizeAvatarImage = async (file: File): Promise<OptimizedAvatarResult> => {
  if (file.size > MAX_SOURCE_FILE_SIZE_BYTES) {
    throw new Error("Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn 25MB.");
  }

  const image = await loadImageElement(file);
  const shouldCompressAggressively = file.size > LARGE_FILE_THRESHOLD_BYTES;
  let currentMaxDimension = shouldCompressAggressively
    ? LARGE_FILE_MAX_DIMENSION
    : DEFAULT_MAX_DIMENSION;
  let currentTargetBytes = shouldCompressAggressively
    ? LARGE_FILE_TARGET_SIZE_BYTES
    : DEFAULT_TARGET_SIZE_BYTES;

  let bestBlob: Blob | null = null;
  let bestWidth = 0;
  let bestHeight = 0;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const { canvas, width, height } = renderImageToCanvas(image, currentMaxDimension);

    for (
      let quality = INITIAL_QUALITY;
      quality >= MIN_QUALITY;
      quality = Number((quality - QUALITY_STEP).toFixed(2))
    ) {
      const blob = await canvasToBlob(canvas, WEBP_MIME_TYPE, quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
        bestWidth = width;
        bestHeight = height;
      }

      if (blob.size <= currentTargetBytes) {
        return {
          dataUrl: await blobToDataUrl(blob),
          sizeInBytes: blob.size,
          width,
          height,
        };
      }
    }

    currentMaxDimension = Math.max(MIN_DIMENSION, Math.round(currentMaxDimension * 0.84));
    currentTargetBytes = Math.max(120 * 1024, Math.round(currentTargetBytes * 0.92));
  }

  if (!bestBlob) {
    throw new Error("Không thể tối ưu ảnh đại diện.");
  }

  return {
    dataUrl: await blobToDataUrl(bestBlob),
    sizeInBytes: bestBlob.size,
    width: bestWidth,
    height: bestHeight,
  };
};
