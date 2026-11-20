"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Package, ShoppingCart, LayoutDashboard, LogOut, FolderOpen, Settings, Store } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 md:min-h-screen">
      <h2 className="text-2xl font-serif font-bold mb-8">Admin Panel</h2>

      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 p-3 rounded transition ${
                active ? "bg-gray-100 text-black font-semibold" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 border-t pt-6 space-y-4">
        <Link href="/" className="flex items-center gap-3 text-gray-600 hover:text-black transition">
          <Store className="w-5 h-5" /> View Store
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 transition w-full text-left"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
