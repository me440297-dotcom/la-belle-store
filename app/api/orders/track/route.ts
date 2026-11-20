import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { orderCode } from "@/app/lib/orders";

// تتبع الطلب: لازم كود الطلب + رقم التليفون مع بعض
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = (searchParams.get("code") ?? "").trim().toLowerCase();
  const phone = (searchParams.get("phone") ?? "").replace(/\s+/g, "");

  if (code.length < 6 || phone.length < 8) {
    return NextResponse.json({ error: "Order code and phone are required" }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { phone, id: { endsWith: code } },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    code: orderCode(order.id),
    status: order.status,
    total: order.total,
    createdAt: order.createdAt,
    items: order.items.map((i) => ({
      name: i.name,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      price: i.price,
    })),
  });
}
