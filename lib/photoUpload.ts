import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "report-photos";
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

export type CompressedPhoto = {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
  bytes: number;
};

export async function compressImage(file: File): Promise<CompressedPhoto> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);
  const { canvas, width, height } = drawScaled(img, MAX_DIMENSION);
  const blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
  const previewUrl = URL.createObjectURL(blob);
  return { blob, previewUrl, width, height, bytes: blob.size };
}

export async function uploadReportPhoto(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  blob: Blob
): Promise<string | null> {
  const path = `${cryptoRandomId()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl ?? null;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function drawScaled(
  img: HTMLImageElement,
  maxDim: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
  const width = Math.round(img.width * ratio);
  const height = Math.round(img.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas encode failed"))),
      type,
      quality
    );
  });
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
