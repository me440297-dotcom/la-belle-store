"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  category: { name: string };
  images: { url: string }[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  // دالة الحذف - اتعدلت تبعت الـ ID في اللينك
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setProducts(products.filter((p) => p.id !== id));
        } else {
          alert("Error deleting product");
        }
      } catch (error) {
        alert("Error deleting product");
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif">Products Management</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-black text-white px-4 py-2 flex items-center gap-2 rounded hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-gray-500 mb-4">No products found. Start adding your first product!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Image</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Price</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded">
                      {product.images[0] && (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover rounded" />
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4 text-gray-500">{product.category?.name || "Uncategorized"}</td>
                  <td className="p-4">{product.price} EGP</td>
                  <td className="p-4 text-right space-x-3">
                    <Link 
                      href={`/admin/products/edit?id=${product.id}`} 
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)} 
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
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