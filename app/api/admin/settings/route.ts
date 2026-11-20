import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { adminGuard } from "@/app/lib/admin";

const clean = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

// جلب الإعدادات
export async function GET() {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// حفظ الإعدادات
export async function PUT(req: Request) {
  const denied = await adminGuard();
  if (denied) return denied;

  try {
    const body = await req.json();
    const whatsappNumber = String(body.whatsappNumber ?? "").replace(/[^\d]/g, "");
    if (whatsappNumber.length < 8) {
      return NextResponse.json(
        { error: "WhatsApp number must be digits with country code, e.g. 201227840123" },
        { status: 400 }
      );
    }

    const data = {
      whatsappNumber,
      facebookUrl: clean(body.facebookUrl),
      instagramUrl: clean(body.instagramUrl),
      contactEmail: clean(body.contactEmail),
      heroTag: String(body.heroTag ?? "").trim(),
      heroTitle: String(body.heroTitle ?? "").trim() || "Layered Style",
      heroSubtitle: String(body.heroSubtitle ?? "").trim() || "Effortless Elegance",
      heroDescription: String(body.heroDescription ?? "").trim(),
      heroButtonText: String(body.heroButtonText ?? "").trim() || "Shop Now",
      heroImage: clean(body.heroImage),
      topBarText: String(body.topBarText ?? "").trim(),
      welcomeTitle: String(body.welcomeTitle ?? "").trim() || "Discover a world of elegance and beauty",
      welcomeSubtitle: String(body.welcomeSubtitle ?? "").trim(),
      welcomeButtonText: String(body.welcomeButtonText ?? "").trim() || "Explore Now",
      welcomeImage: clean(body.welcomeImage),
      sizeChart: clean(body.sizeChart),
    };

    const existing = await prisma.siteSettings.findFirst();
    const saved = existing
      ? await prisma.siteSettings.update({ where: { id: existing.id }, data })
      : await prisma.siteSettings.create({ data });

    return NextResponse.json(saved);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
