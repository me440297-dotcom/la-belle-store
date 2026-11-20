"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, X, Ruler, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/app/store/useCartStore";
import { useWishlistStore } from "@/app/store/useWishlistStore";
import { discountPercent } from "@/app/lib/pricing";
import { parseSizeChart } from "@/app/lib/sizeChart";

type Variant = { id: string; color: string; size: string; stock: number };
type ReviewT = { id: string; name: string; rating: number; comment: string; createdAt: string | Date };

export default function ProductClientDetails({
  product,
  sizeChart,
}: {
  product: any;
  sizeChart?: string | null;
}) {
  const chart = parseSizeChart(sizeChart);
  const router = useRouter();
  const variants: Variant[] = product.variants ?? [];
  const reviews: ReviewT[] = product.reviews ?? [];

  const availableColors = Array.from(new Set(variants.map((v) => v.color)));
  const allSizes = Array.from(new Set(variants.map((v) => v.size)));

  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || "");
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // مراجعة جديدة
  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const { addItem, toggleCart, items: cartItems } = useCartStore();
  const wished = useWishlistStore((s) => s.items.some((i) => i.id === product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);

  // صور اللون المختار الأول، وبعدها الصور المشتركة (اللي مش مربوطة بلون). لو مفيش، كل الصور.
  const galleryImages: { url: string; color: string | null }[] = useMemo(() => {
    const all: { url: string; color: string | null }[] = product.images ?? [];
    const specific = all.filter((i) => i.color === selectedColor);
    const shared = all.filter((i) => !i.color);
    const list = [...specific, ...shared];
    return list.length ? list : all;
  }, [product.images, selectedColor]);

  const safeIdx = Math.min(activeIdx, Math.max(galleryImages.length - 1, 0));
  const mainImage = galleryImages[safeIdx]?.url ?? "";
  const cartImage = galleryImages[0]?.url ?? "";
  const goTo = (delta: number) =>
    setActiveIdx((safeIdx + delta + galleryImages.length) % galleryImages.length);

  const off = discountPercent(product.price, product.oldPrice);
  const selectedStock = selectedSize ? stockFor(selectedColor, selectedSize) : null;

  function stockFor(color: string, size: string) {
    return variants.find((v) => v.color === color && v.size === size)?.stock ?? 0;
  }


  const inCart = (color: string, size: string) =>
    cartItems.find((i) => i.id === product.id && i.color === color && i.size === size)?.quantity ?? 0;

  const average = reviews.length
    ? Math.round((reviews.reduce((t, r) => t + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const handleAdd = () => {
    if (!selectedSize) {
      alert("Please select a size first!");
      return;
    }
    const stock = stockFor(selectedColor, selectedSize);
    if (stock <= 0) {
      alert("Sorry, this size is out of stock.");
      return;
    }
    if (inCart(selectedColor, selectedSize) >= stock) {
      alert(`Only ${stock} left in stock for this option.`);
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: cartImage,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
    toggleCart();
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: reviewName,
          comment: reviewText,
          rating: reviewRating,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setReviewError(data.error || "Could not submit your review.");
        return;
      }
      setReviewName("");
      setReviewText("");
      setReviewRating(5);
      setIsReviewModalOpen(false);
      router.refresh(); // يعيد تحميل التقييمات من الداتابيز
    } catch {
      setReviewError("Network error. Please try again.");
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-16">
      {/* الصور */}
      <div className="w-full md:w-1/2">
        <div className="bg-brand-beige-light aspect-[4/5] relative mb-4 group overflow-hidden">
          {off > 0 && (
            <span className="absolute bottom-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
              -{off}%
            </span>
          )}
          <button
            onClick={() => setIsFullScreen(true)}
            className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
            aria-label="Full screen"
          >
            <Maximize2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() =>
              toggleWish({ id: product.id, name: product.name, price: product.price, image: cartImage })
            }
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-5 h-5 ${wished ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                onClick={() => goTo(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <img src={mainImage} alt={product.name} className="w-full h-full object-cover object-center" />
        </div>

        {/* الصور المصغرة */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 w-16 h-20 border-2 overflow-hidden ${
                  i === safeIdx ? "border-brand-black" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Image ${i + 1}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* التفاصيل */}
      <div className="w-full md:w-1/2 flex flex-col">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-black mb-2">{product.name}</h1>
        <p className="mb-6 flex items-center gap-3 flex-wrap">
          <span className={`text-2xl font-bold ${off > 0 ? "text-red-600" : "text-gray-900"}`}>{product.price} EGP</span>
          {off > 0 && (
            <>
              <span className="text-lg text-gray-400 line-through">{product.oldPrice} EGP</span>
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Save {off}%</span>
            </>
          )}
        </p>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">{product.description}</p>

        {/* الألوان */}
        <div className="mb-6">
          <span className="text-sm font-semibold uppercase tracking-wider block mb-3">
            Color: <span className="text-gray-500 font-normal">{selectedColor}</span>
          </span>
          <div className="flex gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  setActiveIdx(0);
                  if (selectedSize && stockFor(color, selectedSize) <= 0) setSelectedSize("");
                }}
                aria-label={color}
                className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color ? "border-brand-black scale-110 shadow-md" : "border-gray-200 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* المقاسات */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold uppercase tracking-wider">Size</span>
            <button
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs text-gray-500 underline cursor-pointer hover:text-black flex items-center gap-1"
            >
              <Ruler className="w-3 h-3" /> Size Guide
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {allSizes.map((size) => {
              const soldOut = stockFor(selectedColor, size) <= 0;
              return (
                <button
                  key={size}
                  disabled={soldOut}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[48px] py-3 text-sm border transition ${
                    soldOut
                      ? "border-gray-200 text-gray-300 line-through cursor-not-allowed"
                      : selectedSize === size
                      ? "border-brand-black bg-brand-black text-white"
                      : "border-gray-300 hover:border-brand-black"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        {selectedStock !== null && selectedStock > 0 && selectedStock <= 5 && (
          <p className="text-sm text-red-600 font-semibold -mt-4 mb-4">Only {selectedStock} left in stock!</p>
        )}

        {/* الزرار */}
        <button
          onClick={handleAdd}
          className="w-full bg-[#0a192f] text-white py-4 font-semibold text-sm uppercase tracking-widest hover:bg-black transition-colors mb-8"
        >
          Add to Basket
        </button>

        {/* التقييمات */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-serif mb-4">Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 mb-4">No reviews yet. Be the first to review this product.</p>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold">{average}</span>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`w-5 h-5 ${n <= Math.round(average) ? "fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <ul className="space-y-4 mb-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm">{r.name}</span>
                      <span className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-current" : "text-gray-300"}`} />
                        ))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button onClick={() => setIsReviewModalOpen(true)} className="text-sm underline mt-2 hover:text-gray-600">
            Write a review
          </button>
        </div>
      </div>

      {/* المودالز */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button onClick={() => setIsSizeGuideOpen(false)} className="absolute top-4 right-4">
              <X className="w-6 h-6 text-gray-500 hover:text-black" />
            </button>
            <h3 className="text-2xl font-serif mb-6">Size Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    {chart.header.map((h, i) => (
                      <th key={i} className="py-2 pr-3 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="py-2 pr-3 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {isFullScreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <button onClick={() => setIsFullScreen(false)} className="absolute top-6 right-6 text-white hover:text-gray-300">
            <X className="w-8 h-8" />
          </button>
          <img src={mainImage} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>
      )}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-4 right-4">
              <X className="w-6 h-6 text-gray-500 hover:text-black" />
            </button>
            <h3 className="text-2xl font-serif mb-6">Write a Review</h3>
            <form className="space-y-4" onSubmit={submitReview}>
              <div>
                <label className="block text-sm mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                  maxLength={60}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setReviewRating(n)} aria-label={`${n} stars`}>
                      <Star className={`w-7 h-7 ${n <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border p-2 rounded h-24"
                  required
                  maxLength={1000}
                />
              </div>
              {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
              <button
                type="submit"
                disabled={reviewBusy}
                className="w-full bg-brand-black text-white py-3 rounded font-semibold hover:bg-gray-800 disabled:opacity-60"
              >
                {reviewBusy ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
