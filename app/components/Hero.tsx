import Link from "next/link";
import { getSettings } from "@/app/lib/settings";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop";

// Server component: كل النصوص والصورة بتتقرا من إعدادات الأدمن
export default async function Hero() {
  const s = await getSettings();

  return (
    <section className="relative w-full h-[65vh] md:h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={s.heroImage || DEFAULT_IMAGE}
          alt={s.heroTitle}
          className="w-full h-full object-cover object-center"
        />
        {/* تدرّج أبيض علشان النص يتقري بوضوح على الموبايل */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent md:from-white/40"></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative z-10 w-full mt-10 md:mt-0">
        <div className="max-w-xl">
          {s.heroTag && (
            <p className="text-xs md:text-sm tracking-[0.3em] font-semibold uppercase text-black mb-2">{s.heroTag}</p>
          )}

          <h1 className="text-4xl md:text-6xl font-serif text-black mb-2 leading-tight">{s.heroTitle}</h1>

          <h2 className="text-3xl md:text-5xl font-script text-black mb-4">{s.heroSubtitle}</h2>

          {s.heroDescription && <p className="text-sm md:text-base text-black mb-6">{s.heroDescription}</p>}

          <Link
            href="/shop"
            className="inline-block bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors duration-300"
          >
            {s.heroButtonText} →
          </Link>
        </div>
      </div>
    </section>
  );
}
