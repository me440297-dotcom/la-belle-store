"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, ArrowRight, Minus, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/app/store/useCartStore";
import { useSettings } from "@/app/hooks/useSettings";

type Placed = { code: string; total: number; message: string };

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems, getTotalPrice } = useCartStore();
  const { data: session } = useSession();
  const settings = useSettings();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);

  const total = getTotalPrice();

  const buildWhatsAppLink = (code: string, orderTotal: number, snapshot: typeof items) => {
    let message = `مرحباً La Béllé، أنا عملت طلب رقم ${code}:\n\n`;
    snapshot.forEach((item) => {
      message += `- ${item.name} (${item.color}, ${item.size}) x${item.quantity} = ${item.price * item.quantity} EGP\n`;
    });
    message += `\nالإجمالي: ${orderTotal} EGP`;
    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const snapshot = [...items];
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name || session?.user?.name || "",
          phone,
          address,
          items: snapshot.map((i) => ({
            productId: i.id,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // الطلب ماتسجلش — منفتحش الواتساب ونعرض السبب
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      clearCart();
      setPlaced({
        code: data.code,
        total: data.total,
        message: buildWhatsAppLink(data.code, data.total, snapshot),
      });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <h1 className="text-3xl font-serif mb-3">Thank you! 🎉</h1>
          <p className="text-gray-600 mb-6">Your order has been saved.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order code</p>
            <p className="text-3xl font-mono font-bold tracking-widest">{placed.code}</p>
            <p className="text-sm text-gray-500 mt-3">Total: {placed.total} EGP</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Keep this code — you can track your order with it and your phone number.
          </p>
          <a
            href={placed.message}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-[#25D366] text-white py-4 font-semibold text-sm uppercase tracking-widest hover:bg-[#1ebd5a] transition rounded mb-3"
          >
            Send order on WhatsApp
          </a>
          <Link href="/track" className="block text-sm underline mb-2">Track my order</Link>
          <Link href="/shop" className="block text-sm text-gray-500 hover:text-black">Continue shopping</Link>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <div className="container mx-auto px-4 py-20 text-center min-h-[60vh]">
          <h1 className="text-3xl font-serif mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 md:px-8 py-12 min-h-[60vh]">
        <h1 className="text-3xl font-serif mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}-${item.color}`}
                className="flex gap-4 bg-white p-4 border border-gray-100 rounded-lg"
              >
                <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id, item.size, item.color)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.color} | {item.size}
                  </p>
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border rounded">
                      <button
                        className="p-2 hover:bg-gray-100"
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                        aria-label="Decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        className="p-2 hover:bg-gray-100"
                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                        aria-label="Increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-bold">{item.price * item.quantity} EGP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCheckout} className="w-full lg:w-1/3">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
              <h2 className="text-xl font-serif">Order Summary</h2>

              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>{total} EGP</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>Confirmed on WhatsApp</span>
              </div>
              <div className="border-t border-gray-300 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total} EGP</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border p-3 text-sm rounded"
                />
                <input
                  type="tel"
                  required
                  minLength={8}
                  placeholder="Phone (e.g. 01227840123)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border p-3 text-sm rounded"
                />
                <textarea
                  required
                  placeholder="Delivery address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-3 text-sm rounded h-20"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#25D366] text-white py-4 font-semibold text-sm uppercase tracking-widest hover:bg-[#1ebd5a] transition flex items-center justify-center gap-2 rounded disabled:opacity-60"
              >
                {submitting ? "Placing order..." : "Place order"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
