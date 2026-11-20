import Link from "next/link";
import { getSettings } from "@/app/lib/settings";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=2070&auto=format&fit=crop";

// Server component: الصورة والنصوص بتتغير من الأدمن
export default async function WelcomeBanner() {
  const s = await getSettings();

  return (
    <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden">
      {/* الصورة الخلفية */}
      <div className="absolute inset-0 z-0">
        <img
          src={s.welcomeImage || DEFAULT_IMAGE}
          alt={s.welcomeTitle}
          className="w-full h-full object-cover object-center"
        />
        {/* طبقة بينك شفافة عشان تدي لون البراند */}
        <div className="absolute inset-0 bg-[#F8BBD0]/60 mix-blend-multiply"></div>
      </div>

      {/* المحتوى النصي */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="max-w-2xl mx-auto text-black">
          <h2 className="text-4xl md:text-6xl font-serif mb-4 font-bold tracking-wide drop-shadow-md">{s.welcomeTitle}</h2>

          {s.welcomeSubtitle && (
            <p className="text-xl md:text-3xl font-sans font-semibold mb-8 drop-shadow-sm">{s.welcomeSubtitle}</p>
          )}

          <Link
            href="/shop"
            className="inline-block bg-black text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors shadow-lg"
          >
            {s.welcomeButtonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
