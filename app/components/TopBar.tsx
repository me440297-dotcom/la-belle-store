import { getSettings } from "@/app/lib/settings";

export default async function TopBar() {
  const { topBarText } = await getSettings();
  if (!topBarText) return null;

  return (
    <div className="bg-brand-black text-brand-white text-center py-2 text-xs tracking-widest uppercase font-semibold">
      {topBarText}
    </div>
  );
}
