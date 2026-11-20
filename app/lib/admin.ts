import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/lib/auth";

// بنستخدمها أول سطر في أي API خاص بالأدمن:
//   const denied = await adminGuard();
//   if (denied) return denied;
export async function adminGuard() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
