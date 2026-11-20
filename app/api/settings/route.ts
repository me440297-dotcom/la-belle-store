import { NextResponse } from "next/server";
import { getSettings } from "@/app/lib/settings";

// إعدادات عامة للموقع (رقم الواتساب والسوشيال) — آمنة تتعرض للعميل
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getSettings());
}
