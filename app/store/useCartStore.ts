import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string; // product id
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const same = (i: CartItem, id: string, size: string, color: string) =>
  i.id === id && i.size === size && i.color === color;

// السلة بتتحفظ في المتصفح (localStorage) علشان ماتضيعش مع الـ Refresh.
// skipHydration: بنرجّعها بعد ما الصفحة تتحمل (في Providers) علشان نتجنب hydration mismatch.
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => same(i, item.id, item.size, item.color));
          if (existing) {
            return {
              items: state.items.map((i) =>
                same(i, item.id, item.size, item.color)
                  ? { ...i, quantity: Math.min(20, i.quantity + item.quantity) }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id, size, color) =>
        set((state) => ({
          items: state.items.filter((i) => !same(i, id, size, color)),
        })),
      updateQuantity: (id, size, color, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (same(i, id, size, color) ? { ...i, quantity: Math.min(20, quantity) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: "la-belle-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
);
