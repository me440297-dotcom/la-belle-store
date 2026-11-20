import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/admin";

const cleanList = (v: unknown): string[] =>
  Array.from(
    new Set(
      (Array.isArray(v) ? v : [])
        .map((x) => String(x).trim())
        .filter(Boolean)
    )
  );

type ImgIn = { url: string; color: string | null };

// صور المنتج: [{url, color}] (color فاضي = كل الألوان). بنقبل imageUrl القديمة كمان.
function parseImages(body: any): ImgIn[] {
  const raw: any[] = Array.isArray(body.images)
    ? body.images
    : body.imageUrl
    ? [{ url: body.imageUrl }]
    : [];
  return raw
    .map((i) => ({
      url: String(i?.url ?? "").trim(),
      color: i?.color ? String(i.color).trim() : null,
    }))
    .filter((i) => i.url);
}

// السعر قبل الخصم بيتحفظ بس لو أكبر من السعر الحالي
function parseOldPrice(body: any, price: number): number | null {
  const n = Number(body.oldPrice);
  return body.oldPrice != null && body.oldPrice !== "" && n > price ? n : null;
}

async function getOrCreateCategory(name: string) {
  const found = await prisma.category.findFirst({ where: { name } });
  return found ?? prisma.category.create({ data: { name } });
}

// 1. جلب كل المنتجات
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const products = await prisma.product.findMany({
      include: { category: true, images: { orderBy: { position: "asc" } }, variants: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// 2. إضافة منتج جديد
export async function POST(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const price = Number(body.price);
    const categoryName = String(body.categoryName ?? "").trim();
    const images = parseImages(body);
    const sizes = cleanList(body.sizes);
    const colors = cleanList(body.colors);
    const stock = Number.isFinite(Number(body.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : 10;

    if (!name || !(price >= 0) || !categoryName || images.length === 0 || sizes.length === 0 || colors.length === 0) {
      return NextResponse.json(
        { error: "Name, price, category, image, sizes and colors are required" },
        { status: 400 }
      );
    }

    const category = await getOrCreateCategory(categoryName);

    const product = await prisma.product.create({
      data: {
        name,
        description: body.description ? String(body.description) : null,
        price,
        oldPrice: parseOldPrice(body, price),
        categoryId: category.id,
        images: { create: images.map((img, position) => ({ ...img, position })) },
        variants: {
          create: colors.flatMap((color) =>
            sizes.map((size) => ({ color, size, stock }))
          ),
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// 3. الحذف (بناخد الـ ID من اللينك)
export async function DELETE(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

// 4. التعديل (الاسم والسعر والوصف والصورة والقسم والمقاسات والألوان)
export async function PUT(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const body = await req.json();
    const id = String(body.id ?? "");
    const name = String(body.name ?? "").trim();
    const price = Number(body.price);
    const images = parseImages(body);

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    if (!name || !(price >= 0) || images.length === 0) {
      return NextResponse.json({ error: "Name, price and image are required" }, { status: 400 });
    }

    const categoryName = body.categoryName ? String(body.categoryName).trim() : "";
    const category = categoryName ? await getOrCreateCategory(categoryName) : null;

    const sizes = cleanList(body.sizes);
    const colors = cleanList(body.colors);
    const syncVariants = sizes.length > 0 && colors.length > 0;

    const product = await prisma.$transaction(async (tx) => {
      if (syncVariants) {
        // نحافظ على المخزون الحالي للتركيبات الموجودة، ونمسح اللي اتشالت، ونضيف الجديد
        const existing = await tx.variant.findMany({ where: { productId: id } });
        const wanted = new Set(colors.flatMap((c) => sizes.map((s) => `${c}|${s}`)));

        const toDelete = existing.filter((v) => !wanted.has(`${v.color}|${v.size}`));
        if (toDelete.length) {
          await tx.variant.deleteMany({ where: { id: { in: toDelete.map((v) => v.id) } } });
        }

        const have = new Set(existing.map((v) => `${v.color}|${v.size}`));
        const toCreate = colors.flatMap((color) =>
          sizes
            .filter((size) => !have.has(`${color}|${size}`))
            .map((size) => ({ productId: id, color, size, stock: 10 }))
        );
        if (toCreate.length) {
          await tx.variant.createMany({ data: toCreate });
        }
      }

      return tx.product.update({
        where: { id },
        data: {
          name,
          description: body.description ? String(body.description) : null,
          price,
          oldPrice: parseOldPrice(body, price),
          ...(category ? { categoryId: category.id } : {}),
          images: {
            deleteMany: {},
            create: images.map((img, position) => ({ ...img, position })),
          },
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// 5. تعديل مخزون مقاس/لون معين
export async function PATCH(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const { variantId, stock } = await req.json();
    const n = Math.floor(Number(stock));
    if (!variantId || !(n >= 0)) {
      return NextResponse.json({ error: "Invalid variant or stock" }, { status: 400 });
    }
    const variant = await prisma.variant.update({
      where: { id: String(variantId) },
      data: { stock: n },
    });
    return NextResponse.json(variant);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
