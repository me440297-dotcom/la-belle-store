import { prisma } from "@/app/lib/prisma";

export type PublicSettings = {
  whatsappNumber: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  contactEmail: string | null;
  topBarText: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroButtonText: string;
  heroImage: string | null;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeButtonText: string;
  welcomeImage: string | null;
  sizeChart: string | null;
};

export const DEFAULT_SETTINGS: PublicSettings = {
  whatsappNumber: "201227840123",
  facebookUrl: null,
  instagramUrl: null,
  contactEmail: null,
  topBarText: "New Products Every Day!",
  heroTag: "New Collection",
  heroTitle: "Layered Style",
  heroSubtitle: "Effortless Elegance",
  heroDescription: "Sweater + Shirt = Perfect Look",
  heroButtonText: "Shop Now",
  heroImage: null,
  welcomeTitle: "Discover a world of elegance and beauty",
  welcomeSubtitle: "The latest fashion trends",
  welcomeButtonText: "Explore Now",
  welcomeImage: null,
  sizeChart: null,
};

// بتقرا الإعدادات من الداتابيز، ولو فيه مشكلة بترجع الافتراضي علشان الموقع ما يقعش
export async function getSettings(): Promise<PublicSettings> {
  try {
    const s = await prisma.siteSettings.findFirst();
    if (!s) return DEFAULT_SETTINGS;
    return {
      whatsappNumber: s.whatsappNumber,
      facebookUrl: s.facebookUrl,
      instagramUrl: s.instagramUrl,
      contactEmail: s.contactEmail,
      topBarText: s.topBarText,
      heroTag: s.heroTag,
      heroTitle: s.heroTitle,
      heroSubtitle: s.heroSubtitle,
      heroDescription: s.heroDescription,
      heroButtonText: s.heroButtonText,
      heroImage: s.heroImage,
      welcomeTitle: s.welcomeTitle,
      welcomeSubtitle: s.welcomeSubtitle,
      welcomeButtonText: s.welcomeButtonText,
      welcomeImage: s.welcomeImage,
      sizeChart: s.sizeChart,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
