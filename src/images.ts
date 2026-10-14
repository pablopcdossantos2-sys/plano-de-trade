import type { Attachment } from "./types";

const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const TARGET_BYTES = 650 * 1024;
const MAX_EDGE = 1440;

function readAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("O arquivo não é uma imagem válida."));
    image.onload = () => resolve(image);
    image.src = source;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Falha ao compactar a imagem.")), "image/webp", quality);
  });
}

export async function prepareImage(file: File): Promise<Attachment> {
  if (!file.type.startsWith("image/")) throw new Error("Selecione um arquivo de imagem.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("A imagem original deve ter no máximo 12 MB.");

  const original = await readAsDataUrl(file);
  const image = await loadImage(original);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("O navegador não conseguiu preparar a imagem.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.84;
  let blob = await canvasBlob(canvas, quality);
  while (blob.size > TARGET_BYTES && quality > 0.42) {
    quality -= 0.08;
    blob = await canvasBlob(canvas, quality);
  }
  if (blob.size > TARGET_BYTES * 1.4) throw new Error("A imagem continuou muito grande após a compactação.");

  return {
    id: crypto.randomUUID(),
    name: `${file.name.replace(/\.[^.]+$/, "").slice(0, 120) || "imagem"}.webp`,
    dataUrl: await readAsDataUrl(blob),
    createdAt: new Date().toISOString(),
  };
}
