"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingBag, Menu, User, Heart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/app/store/useCartStore";
import { useWishlistStore } from "@/app/store/useWishlistStore";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/track", label: "Track Order" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const totalItems = useCartStore((s) => s.items.reduce((t, i) => t + i.quantity, 0));
  const wishlistCount = useWishlistStore((s) => s.items.length);

  // يقفل المنيو لما تنتقل لصفحة تانية
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // يمنع السكرول ورا المنيو وهي مفتوحة
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        {/* الشمال: القائمة والبحث */}
        <div className="flex items-center gap-4 md:gap-6 w-1/3">
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Menu className="w-6 h-6 text-brand-black" />
          </button>

          <Link href="/search" className="hidden md:block" aria-label="Search">
            <Search className="w-5 h-5 text-brand-black hover:text-gray-500 transition" />
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-medium">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-gray-500 transition">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* النص: اللوجو */}
        <div className="w-1/3 text-center flex justify-center">
          <Link href="/" className="text-3xl md:text-4xl font-serif font-bold tracking-wider text-brand-black">
            La Béllé
          </Link>
        </div>

        {/* اليمين: المستخدم والسلة */}
        <div className="flex items-center justify-end gap-4 md:gap-6 w-1/3">
          <Link href="/search" className="md:hidden" aria-label="Search">
            <Search className="w-5 h-5 text-brand-black" />
          </Link>

          <Link href="/wishlist" className="relative hidden md:block" aria-label="Wishlist">
            <Heart className="w-5 h-5 text-brand-black hover:text-gray-500 transition" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-black text-brand-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/login" className="hidden md:block" aria-label="Account">
            <User className="w-5 h-5 text-brand-black hover:text-gray-500 transition" />
          </Link>

          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingBag className="w-5 h-5 text-brand-black hover:text-gray-500 transition" />
            <span className="absolute -top-2 -right-2 bg-brand-black text-brand-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              {totalItems}
            </span>
          </Link>
        </div>
      </div>

      {/* منيو الموبايل */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-72 max-w-[85%] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-2xl font-serif font-bold">La Béllé</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 text-lg">
              {[
                { href: "/", label: "Home" },
                ...NAV,
                { href: "/search", label: "Search" },
                { href: "/wishlist", label: `Wishlist${wishlistCount ? ` (${wishlistCount})` : ""}` },
                { href: "/login", label: "Account / Login" },
              ].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-3 border-b border-gray-100 ${
                    pathname === n.href ? "font-bold text-black" : "text-gray-700"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
