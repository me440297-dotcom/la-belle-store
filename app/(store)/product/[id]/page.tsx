import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductClientDetails from "./ProductClientDetails";
import ProductCard from "@/app/components/ProductCard";
import { getSettings } from "@/app/lib/settings";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // في Next.js 15 لازم نستنى الـ params الأول
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) {
    notFound();
  }

  const settings = await getSettings();

  // منتجات مشابهة من نفس القسم
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    include: { images: { orderBy: { position: "asc" } }, variants: { select: { stock: true } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      {/* مسار التنقل */}
      <div className="text-sm text-gray-500 mb-8 flex gap-2">
        <Link href="/" className="hover:text-black">Home</Link> /
        <Link href="/shop" className="hover:text-black">Shop</Link> /
        <span className="text-black font-semibold">{product.name}</span>
      </div>

      {/* تفاصيل المنتج */}
      <ProductClientDetails product={product} sizeChart={settings.sizeChart} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-serif mb-6">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}