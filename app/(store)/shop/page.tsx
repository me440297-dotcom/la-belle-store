"use client";

import ProductCard, { CardProduct } from "@/app/components/ProductCard";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Product = CardProduct & {
  category: { id: string; name: string };
  createdAt?: string;
};

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sort, setSort] = useState("newest");
  const [onlySale, setOnlySale] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ id: string; name: string }[]>([]);

  // الأقسام بتيجي من الداتابيز، فأي قسم تضيفه من الأدمن يظهر هنا لوحده
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => Array.isArray(data) && setDbCategories(data))
      .catch(() => {});
  }, []);

  // جلب المنتجات من الـ API
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // فلترة وترتيب المنتجات
  const filteredProducts = products
    .filter((p) => selectedCategory === "all" || p.category?.name?.toLowerCase() === selectedCategory.toLowerCase())
    .filter((p) => !onlySale || (p.oldPrice != null && p.oldPrice > p.price))
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return 0; // newest: الـ API راجعهم من الأحدث
    });

  const categoriesList = [
    { id: "all", title: "All" },
    ...dbCategories.map((c) => ({ id: c.id, title: c.name })),
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif mb-4">Shop Collection</h1>
        <p className="text-gray-500">Discover our latest arrivals and timeless pieces.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* الفلاتر */}
        <div className="w-full md:w-1/4">
          <h3 className="font-semibold uppercase tracking-widest text-sm mb-4">Categories</h3>
          <ul className="space-y-2">
            {categoriesList.map((cat) => (
              <li key={cat.id}>
                <button 
                  onClick={() => setSelectedCategory(cat.id === "all" ? "all" : cat.title)}
                  className={`text-sm ${selectedCategory === (cat.id === "all" ? "all" : cat.title) ? 'text-black font-bold underline' : 'text-gray-500 hover:text-black'}`}
                >
                  {cat.title}
                </button>
              </li>
            ))}
          </ul>

          <h3 className="font-semibold uppercase tracking-widest text-sm mt-8 mb-3">Sort by</h3>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full border p-2 text-sm bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>

          <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
            <input type="checkbox" checked={onlySale} onChange={(e) => setOnlySale(e.target.checked)} />
            On sale only
          </label>
        </div>

        {/* شبكة المنتجات */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <p className="text-center py-10">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No products found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}