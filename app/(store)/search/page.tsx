"use client";

import { useEffect, useState } from "react";
import ProductCard, { CardProduct } from "@/app/components/ProductCard";
import { Search as SearchIcon } from "lucide-react";

type Product = CardProduct & { category?: { name: string } | null };

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // المنتجات الحقيقية من الداتابيز (بدل البيانات التجريبية القديمة)
  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const q = query.trim().toLowerCase();
  const filteredProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.name ?? "").toLowerCase().includes(q)
      )
    : [];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-[60vh]">
      {/* مربع البحث */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-b-2 border-gray-300 py-4 pl-12 text-lg focus:outline-none focus:border-black transition-colors"
            autoFocus
          />
          <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* النتايج */}
      <div>
        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {q && (
          <h2 className="text-xl font-serif mb-6">
            Search results for: <span className="text-gray-500">&quot;{query}&quot;</span>
          </h2>
        )}

        {!loading && q && filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No products found. Try searching for something else.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
