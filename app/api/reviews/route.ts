import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = String(body.productId ?? "");
    const name = String(body.name ?? "").trim().slice(0, 60);
    const comment = String(body.comment ?? "").trim().slice(0, 1000);
    const rating = Math.floor(Number(body.rating));

    if (!productId || !name || !comment || !(rating >= 1 && rating <= 5)) {
      return NextResponse.json({ error: "Name, comment and rating (1-5) are required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await prisma.review.create({
      data: { productId, name, comment, rating },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save review" }, { status: 500 });
  }
}
