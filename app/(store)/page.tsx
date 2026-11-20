import TopBar from "../components/TopBar";
import Hero from "../components/Hero";
import WelcomeBanner from "../components/WelcomeBanner";
import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import ProductCard from "../components/ProductCard";

const categories = [
  { id: "tops", title: "Tops", description: "Stylish tops for every occasion", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop" },
  { id: "denim", title: "Denim & Jeans", description: "Timeless denim styles", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1000&auto=format&fit=crop" },
  { id: "leggings", title: "Leggings & Pants", description: "Comfort meets style", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1000&auto=format&fit=crop" },
  { id: "dresses", title: "Dresses", description: "Elegant dresses for you", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop" },
  { id: "coats", title: "Coats & Jackets", description: "Stay warm, look chic", image: "https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop" },
  { id: "skirts", title: "Skirts", description: "Flirty skirts for every mood", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1000&auto=format&fit=crop" },
  { id: "care", title: "Personal & Home Care", description: "Care for yourself and your home", image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop" },
];

export default async function Home() {
  // أحدث المنتجات (لو الداتابيز مش متاحة الصفحة تفضل شغالة من غيرها)
  const latest = await prisma.product
    .findMany({
      include: { images: { orderBy: { position: "asc" } }, variants: { select: { stock: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    })
    .catch(() => []);

  // الأقسام بتيجي من الداتابيز (الصورة والوصف بيتعدلوا من الداشبورد). لو القسم من غير صورة بنستخدم الافتراضية.
  const dbCategories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } }).catch(() => []);
  const cards = dbCategories.length
    ? dbCategories.map((c) => {
        const fallback = categories.find((d) => d.title.toLowerCase() === c.name.toLowerCase());
        return {
          id: c.id,
          title: c.name,
          description: c.description ?? fallback?.description ?? "",
          image: c.image || fallback?.image || "https://via.placeholder.com/1000x600?text=La+Belle",
        };
      })
    : categories;

  return (
    <>
      <TopBar />
      <Hero />
      <WelcomeBanner />

      {latest.length > 0 && (
        <section className="container mx-auto px-4 md:px-8 pt-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-3xl font-serif">New Arrivals</h2>
            <Link href="/shop" className="text-sm underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col gap-4">
          {cards.map((category) => (
            <div key={category.id} className="bg-brand-beige-light rounded-sm overflow-hidden flex flex-col md:flex-row items-stretch group cursor-pointer">
              <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                <h3 className="text-3xl md:text-4xl font-serif mb-2 text-brand-black">{category.title}</h3>
                <p className="text-gray-600 mb-6 text-sm md:text-base">{category.description}</p>
                <Link href={`/shop?category=${encodeURIComponent(category.title)}`} className="bg-brand-black text-brand-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition w-fit inline-block">
                  Shop Now →
                </Link>
              </div>
              <div className="md:w-1/2 h-64 md:h-72 w-full overflow-hidden relative">
                <img src={category.image} alt={category.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}