// نسبة الخصم: بتظهر بس لو السعر قبل الخصم أكبر من السعر الحالي
export function discountPercent(price: number, oldPrice?: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
