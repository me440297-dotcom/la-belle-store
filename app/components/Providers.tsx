"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useCartStore } from "@/app/store/useCartStore";
import { useWishlistStore } from "@/app/store/useWishlistStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  // نرجّع السلة والمفضلة من localStorage بعد تحميل الصفحة
  useEffect(() => {
    useCartStore.persist.rehydrate();
    useWishlistStore.persist.rehydrate();
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}
