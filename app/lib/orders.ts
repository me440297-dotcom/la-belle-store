// كود الطلب اللي العميل بيشوفه ويستخدمه في التتبع (آخر 8 حروف من الـ id)
export const orderCode = (id: string) => id.slice(-8).toUpperCase();

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
