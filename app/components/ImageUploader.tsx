"use client";

import { useState } from "react";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

type Props = {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
};

// حقل صورة: بتلصق لينك، أو (لو Cloudinary متظبط في .env) بترفع صورة من الموبايل/الكمبيوتر مباشرة
export default function ImageUploader({ value, onChange, placeholder = "https://..." }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const canUpload = Boolean(CLOUD && PRESET);

  const handleFile = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) return setError("Please choose an image file");
    if (file.size > 8 * 1024 * 1024) return setError("Image is larger than 8 MB");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", PRESET as string);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.secure_url) throw new Error(data?.error?.message || "Upload failed");
      onChange(data.secure_url);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-start">
        {value ? (
          <img src={value} alt="" className="w-16 h-20 object-cover rounded border bg-gray-100 shrink-0" />
        ) : (
          <div className="w-16 h-20 rounded border border-dashed bg-gray-50 shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border p-2 rounded text-sm"
          />
          {canUpload && (
            <label className="inline-block text-sm border rounded px-3 py-1.5 cursor-pointer hover:bg-gray-50">
              {uploading ? "Uploading..." : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
