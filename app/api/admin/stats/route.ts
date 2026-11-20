import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/admin";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const [products, orders, sales, pending] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      // المبيعات = الطلبات اللي مش ملغية
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    return NextResponse.json({
      products,
      orders,
      pending,
      sales: sales._sum.total ?? 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
