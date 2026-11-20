import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/admin";
import { ORDER_STATUSES } from "@/app/lib/orders";

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// تغيير حالة الطلب
export async function PATCH(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { id, status } = await req.json();
    if (!id || !ORDER_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    const current = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!current) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // لو الطلب اتلغى نرجّع المخزون، ولو رجع من الإلغاء نخصمه تاني
    const wasCancelled = current.status === "CANCELLED";
    const willCancel = status === "CANCELLED";

    const updated = await prisma.$transaction(async (tx) => {
      if (!wasCancelled && willCancel) {
        for (const item of current.items) {
          if (!item.size || !item.color) continue;
          await tx.variant.updateMany({
            where: { productId: item.productId, size: item.size, color: item.color },
            data: { stock: { increment: item.quantity } },
          });
        }
      } else if (wasCancelled && !willCancel) {
        for (const item of current.items) {
          if (!item.size || !item.color) continue;
          const res = await tx.variant.updateMany({
            where: {
              productId: item.productId,
              size: item.size,
              color: item.color,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (res.count === 0) {
            throw new Error("STOCK");
          }
        }
      }
      return tx.order.update({ where: { id }, data: { status } });
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.message === "STOCK") {
      return NextResponse.json(
        { error: "Not enough stock to re-activate this cancelled order" },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
