import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/lib/auth";
import { orderCode } from "@/app/lib/orders";

class OrderError extends Error {}

type IncomingItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customerName = String(body.customerName ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\s+/g, "");
    const address = String(body.address ?? "").trim();
    const rawItems: unknown = body.items;

    if (!customerName || phone.length < 8 || !address) {
      return NextResponse.json(
        { error: "Name, phone and address are required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const items: IncomingItem[] = rawItems.map((i: any) => ({
      productId: String(i.productId ?? i.id ?? ""),
      size: String(i.size ?? ""),
      color: String(i.color ?? ""),
      quantity: Math.floor(Number(i.quantity)),
    }));

    if (items.some((i) => !i.productId || !i.size || !i.color || !(i.quantity >= 1 && i.quantity <= 20))) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;

    const products = await prisma.product.findMany({
      where: { id: { in: Array.from(new Set(items.map((i) => i.productId))) } },
      include: { variants: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // كل حاجة في transaction واحدة: لو أي صنف خلص، الطلب كله يتلغي ومفيش مخزون يتخصم
    const order = await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItems: {
        productId: string;
        quantity: number;
        price: number;
        name: string;
        size: string;
        color: string;
      }[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new OrderError("One of the products is no longer available");
        }
        const variant = product.variants.find(
          (v) => v.size === item.size && v.color === item.color
        );
        if (!variant) {
          throw new OrderError(`"${product.name}" (${item.color} / ${item.size}) is no longer available`);
        }

        // خصم ذري: ينجح بس لو المخزون كفاية
        const updated = await tx.variant.updateMany({
          where: { id: variant.id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          throw new OrderError(`"${product.name}" (${item.color} / ${item.size}) is out of stock or not enough quantity`);
        }

        // السعر بييجي من الداتابيز مش من المتصفح
        total += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
          size: item.size,
          color: item.color,
        });
      }

      return tx.order.create({
        data: {
          customerName,
          phone,
          address,
          total,
          status: "PENDING",
          userId: userId ?? null,
          items: { create: orderItems },
        },
      });
    });

    return NextResponse.json({
      id: order.id,
      code: orderCode(order.id),
      total: order.total,
      status: order.status,
    });
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
