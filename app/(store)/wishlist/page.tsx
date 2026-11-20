"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/app/store/useWishlistStore";

export default function WishlistPage() {
  const { items, remove } = useWishlistStore();

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 min-h-[60vh]">
      <h1 className="text-3xl font-serif text-center mb-8">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="mb-6">You haven&apos;t saved anything yet.</p>
          <Link href="/shop" className="inline-block bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link href={`/product/${item.id}`} className="block">
                <div className="bg-brand-beige-light aspect-[4/5] overflow-hidden mb-3">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-600">{item.price} EGP</p>
              </Link>
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm"
                aria-label="Remove from wishlist"
              >
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
