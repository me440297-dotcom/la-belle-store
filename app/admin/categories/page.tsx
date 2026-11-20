"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

type Category = {
  id: string;
  name: string;
  image?: string | null;
  _count: { products: number };
};

async function readError(res: Response) {
  const data = await res.json().catch(() => ({}));
  return data.error || "Something went wrong";
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    const res = await fetch(`/api/admin/categories?id=${category.id}`, { method: "DELETE" });
    if (!res.ok) return alert(await readError(res));
    setCategories(categories.filter((c) => c.id !== category.id));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif">Categories Management</h1>
        {/* الزرار بقى Link */}
        <Link 
          href="/admin/categories/new" 
          className="bg-black text-white px-4 py-2 flex items-center gap-2 rounded hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Products Count</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img src={category.image} alt="" className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100" />
                      )}
                      {category.name}
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{category._count.products} Products</td>
                  <td className="p-4 text-right space-x-2">
                    <Link href={`/admin/categories/edit?id=${category.id}`} className="text-blue-500 hover:underline text-sm">Edit</Link>
                    <button onClick={() => handleDelete(category)} className="text-red-500 hover:underline text-sm">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}