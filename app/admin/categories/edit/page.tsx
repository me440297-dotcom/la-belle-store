"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ImageUploader from "@/app/components/ImageUploader";

function EditCategoryForm() {
  const router = useRouter();
  const id = useSearchParams().get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((list: any[]) => {
        const c = list.find((x) => x.id === id);
        if (c) {
          setName(c.name || "");
          setDescription(c.description || "");
          setImage(c.image || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, description, image }),
      });
      if (res.ok) {
        router.push("/admin/categories");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error saving category");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!id) return <div className="p-8 text-center">No category selected.</div>;

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-serif mb-6">Edit Category</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <p className="text-xs text-gray-400 mt-1">Changing the name also changes it for all products in this category.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Short description (shown on the home page)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <ImageUploader value={image} onChange={setImage} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Category"}
        </button>
      </form>
    </div>
  );
}

export default function EditCategoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EditCategoryForm />
    </Suspense>
  );
}
