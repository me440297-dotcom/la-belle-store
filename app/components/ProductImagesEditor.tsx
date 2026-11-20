"use client";

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import ImageUploader from "@/app/components/ImageUploader";

export type EditableImage = { url: string; color: string };

type Props = {
  images: EditableImage[];
  colors: string[]; // الألوان المكتوبة في خانة Colors
  onChange: (images: EditableImage[]) => void;
};

// بيسمح بأكتر من صورة للمنتج، وكل صورة تتربط بلون (أو "كل الألوان")
export default function ProductImagesEditor({ images, colors, onChange }: Props) {
  const update = (i: number, patch: Partial<EditableImage>) =>
    onChange(images.map((img, idx) => (idx === i ? { ...img, ...patch } : img)));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {images.map((img, i) => (
        <div key={i} className="border rounded p-3 bg-gray-50 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{i === 0 ? "Main image (shown in listings)" : `Image ${i + 1}`}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="disabled:opacity-30">
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === images.length - 1}
                aria-label="Move down"
                className="disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              {images.length > 1 && (
                <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} aria-label="Remove image" className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <ImageUploader value={img.url} onChange={(url) => update(i, { url })} />

          <div>
            <label className="block text-xs text-gray-500 mb-1">Shown with color</label>
            <select
              value={img.color}
              onChange={(e) => update(i, { color: e.target.value })}
              className="w-full border p-2 rounded text-sm bg-white"
            >
              <option value="">All colors</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              {/* لو اللون اتشال من خانة Colors بعد ما اتربط بصورة */}
              {img.color && !colors.includes(img.color) && <option value={img.color}>{img.color} (not in colors list)</option>}
            </select>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...images, { url: "", color: "" }])}
        className="flex items-center gap-2 text-sm border border-dashed rounded px-3 py-2 hover:bg-gray-50"
      >
        <Plus className="w-4 h-4" /> Add another image
      </button>
    </div>
  );
}
