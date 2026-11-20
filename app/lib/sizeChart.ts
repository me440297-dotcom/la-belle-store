// جدول المقاسات بيتكتب من الداشبورد كنص: كل سطر = صف، والقيم بينها فاصلة (,)
// أول سطر = عناوين الأعمدة.
export const DEFAULT_SIZE_CHART = `Size,Chest (cm),Length (cm)
S,96,68
M,100,70
L,104,72`;

export function parseSizeChart(text?: string | null): { header: string[]; rows: string[][] } {
  const lines = (text && text.trim() ? text : DEFAULT_SIZE_CHART)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // بيقبل الفاصلة أو | أو Tab (لو نسخت من Excel)
  const table = lines.map((l) => l.split(/[,|\t]/).map((c) => c.trim()));
  return { header: table[0] ?? [], rows: table.slice(1) };
}
