"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = { products: number; orders: number; pending: number; sales: number };

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setStats)
      .catch(() => setError(true));
  }, []);

  const cards = [
    { label: "Total Products", value: stats ? String(stats.products) : "—" },
    { label: "Total Orders", value: stats ? String(stats.orders) : "—" },
    { label: "Pending Orders", value: stats ? String(stats.pending) : "—" },
    { label: "Total Sales", value: stats ? `${stats.sales} EGP` : "—" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-serif mb-6">Welcome back, Admin</h1>

      {error && <p className="text-red-500 mb-4">Could not load statistics.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-semibold mb-2">{c.label}</h3>
            <p className="text-3xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>

      {stats && stats.pending > 0 && (
        <p className="mt-6 text-sm">
          You have <b>{stats.pending}</b> new order(s) waiting.{" "}
          <Link href="/admin/orders" className="underline">
            Review them
          </Link>
        </p>
      )}
    </div>
  );
}
