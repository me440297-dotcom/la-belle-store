"use client";

import { Fragment, useEffect, useState } from "react";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

type OrderItem = {
  id: string;
  name: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string | null;
  total: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setOrders(data))
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  const changeStatus = async (id: string, status: string) => {
    const previous = orders;
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setOrders(previous);
      alert(data.error || "Failed to update status");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-serif mb-6">Orders Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Code</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Customer</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Total</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <Fragment key={order.id}>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-xs">{order.id.slice(-8).toUpperCase()}</td>
                    <td className="p-4">
                      <div>{order.customerName}</div>
                      <a href={`tel:${order.phone}`} className="text-xs text-gray-500 hover:underline">
                        {order.phone}
                      </a>
                    </td>
                    <td className="p-4 font-bold">{order.total} EGP</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => changeStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-semibold border-0 ${COLORS[order.status] ?? ""}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setOpenId(openId === order.id ? null : order.id)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        {openId === order.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                  {openId === order.id && (
                    <tr className="border-b bg-gray-50">
                      <td colSpan={6} className="p-4 text-sm">
                        <p className="mb-2">
                          <b>Address:</b> {order.address || "—"}
                        </p>
                        <ul className="space-y-1">
                          {order.items.map((it) => (
                            <li key={it.id}>
                              {it.name ?? "Product"} {it.color && it.size ? `(${it.color}, ${it.size})` : ""} × {it.quantity} —{" "}
                              {it.price * it.quantity} EGP
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
