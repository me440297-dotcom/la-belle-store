"use client";

import { useState } from "react";

type Tracked = {
  code: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  items: { name: string | null; size: string | null; color: string | null; quantity: number; price: number }[];
};

const STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;
const LABELS: Record<string, string> = {
  PENDING: "Received",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Tracked | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);
    try {
      const qs = new URLSearchParams({ code: code.trim(), phone: phone.trim() });
      const res = await fetch(`/api/orders/track?${qs.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 404 ? "No order found with this code and phone number." : data.error || "Something went wrong.");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? STEPS.indexOf(order.status as (typeof STEPS)[number]) : -1;

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl min-h-[60vh]">
      <h1 className="text-3xl font-serif text-center mb-2">Track Your Order</h1>
      <p className="text-center text-gray-500 mb-8 text-sm">Enter the order code you received and your phone number.</p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          type="text"
          required
          placeholder="Order code (e.g. AB12CD34)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border p-3 text-sm uppercase tracking-widest"
        />
        <input
          type="tel"
          required
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border p-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 font-semibold text-sm uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded text-center">{error}</div>}

      {order && (
        <div className="border rounded-lg p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="font-mono font-bold tracking-widest">{order.code}</span>
            <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>

          {order.status === "CANCELLED" ? (
            <p className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 text-center font-semibold">Order cancelled</p>
          ) : (
            <div className="flex items-center justify-between mb-6">
              {STEPS.map((step, i) => (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`mx-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStep ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className={`text-[11px] mt-1 ${i <= currentStep ? "text-black font-semibold" : "text-gray-400"}`}>
                    {LABELS[step]}
                  </p>
                </div>
              ))}
            </div>
          )}

          <ul className="text-sm divide-y">
            {order.items.map((it, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>
                  {it.name ?? "Product"} {it.color && it.size ? `(${it.color}, ${it.size})` : ""} × {it.quantity}
                </span>
                <span>{it.price * it.quantity} EGP</span>
              </li>
            ))}
          </ul>
          <p className="text-right font-bold mt-4">Total: {order.total} EGP</p>
        </div>
      )}
    </div>
  );
}
