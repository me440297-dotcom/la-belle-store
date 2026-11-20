"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Settings } from "lucide-react";

export default function AdminFloatingButton() {
  const { data: session } = useSession();

  // لو مفيش session أو اليوزر مش أدمن، الزرار مش هيظهر
  if (!session || (session.user as any)?.role !== "ADMIN") {
    return null;
  }

  return (
    <Link 
      href="/admin" 
      className="fixed bottom-6 left-6 z-[100] bg-[#800000] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:bg-[#600000] transition-all transform hover:scale-105 border-2 border-white"
    >
      <Settings className="w-5 h-5" />
      <span className="font-semibold text-sm">تعديلات</span>
    </Link>
  );
}