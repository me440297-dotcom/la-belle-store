"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductImagesEditor, { EditableImage } from "@/app/components/ProductImagesEditor";

const splitList = (v: string) =>
  v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

function EditProductForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<EditableImage[]>([{ url: "", color: "" }]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    categoryName: "",
    sizes: "",
    colors: "",
  });

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          oldPrice: data.oldPrice?.toString() || "",
          categoryName: data.category?.name || "",
          sizes: Array.from(new Set((data.variants || []).map((v: any) => v.size))).join(","),
          colors: Array.from(new Set((data.variants || []).map((v: any) => v.color))).join(","),
        });
        const imgs: EditableImage[] = (data.images || []).map((i: any) => ({ url: i.url, color: i.color || "" }));
        setImages(imgs.length ? imgs : [{ url: "", color: "" }]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanImages = images.filter((i) => i.url.trim());
    if (cleanImages.length === 0) return alert("Add at least one image");

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
          categoryName: formData.categoryName,
          images: cleanImages,
          sizes: splitList(formData.sizes),
          colors: splitList(formData.colors),
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Error: ${data.error || "Failed to update"}`);
      }
    } catch (error) {
      alert("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading product data...</div>;
  if (!productId) return <div className="p-8 text-center">No product selected.</div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-serif mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price (EGP)</label>
            <input
              type="number"
              required
              min={0}
              step="any"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price before discount (optional)</label>
            <input
              type="number"
              min={0}
              step="any"
              value={formData.oldPrice}
              onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-2">
          Leave the old price empty to remove the discount. It only shows if it is higher than the price.
        </p>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border p-2 rounded h-24"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            required
            value={formData.categoryName}
            onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sizes (comma separated)</label>
            <input
              type="text"
              value={formData.sizes}
              onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Colors (comma separated)</label>
            <input
              type="text"
              value={formData.colors}
              onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">Existing stock is kept for sizes/colors that stay; new combinations start at 10.</p>

        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <ProductImagesEditor images={images} colors={splitList(formData.colors)} onChange={setImages} />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Update Product"}
        </button>
      </form>
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <EditProductForm />
    </Suspense>
  );
}
