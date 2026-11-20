import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/admin";

const clean = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const exists = await prisma.category.findFirst({ where: { name } });
    if (exists) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    const category = await prisma.category.create({
      data: { name, description: clean(body.description), image: clean(body.image) },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// تعديل اسم قسم
export async function PUT(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    const name = String(body.name ?? "").trim();
    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 });
    }
    const clash = await prisma.category.findFirst({ where: { name, NOT: { id } } });
    if (clash) {
      return NextResponse.json({ error: "Another category already has this name" }, { status: 409 });
    }
    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        // الحقول دي بتتغير بس لو اتبعتت (علشان تغيير الاسم لوحده ما يمسحش الصورة)
        ...("description" in body ? { description: clean(body.description) } : {}),
        ...("image" in body ? { image: clean(body.image) } : {}),
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// حذف قسم (ممنوع لو فيه منتجات جواه)
export async function DELETE(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: `This category has ${count} product(s). Move or delete them first.` },
        { status: 409 }
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
