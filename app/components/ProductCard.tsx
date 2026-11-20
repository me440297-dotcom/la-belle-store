import Link from "next/link";
import { discountPercent } from "@/app/lib/pricing";

export type CardProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  images: { url: string; color?: string | null }[];
  variants?: { stock: number }[];
};

// كارت منتج واحد بيستخدم في الشوب والبحث والرئيسية والمنتجات المشابهة
export default function ProductCard({ product }: { product: CardProduct }) {
  const off = discountPercent(product.price, product.oldPrice);
  const soldOut = !!product.variants && product.variants.length > 0 && product.variants.every((v) => v.stock <= 0);
  const image = product.images[0]?.url || "https://via.placeholder.com/400x500?text=No+image";

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-brand-beige-light aspect-[4/5] relative overflow-hidden mb-3">
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            soldOut ? "opacity-60" : ""
          }`}
        />
        {off > 0 && !soldOut && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-1 rounded">
            -{off}%
          </span>
        )}
        {soldOut && (
          <span className="absolute top-2 left-2 bg-black text-white text-[11px] font-bold px-2 py-1 rounded">
            SOLD OUT
          </span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{product.name}</h3>
      <p className="text-sm">
        <span className={off > 0 ? "text-red-600 font-bold" : "text-gray-600"}>{product.price} EGP</span>
        {off > 0 && <span className="text-gray-400 line-through ml-2">{product.oldPrice} EGP</span>}
      </p>
    </Link>
  );
}
