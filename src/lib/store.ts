import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  color: string;
  packs: number;
  pack_size: number;
  category: string;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, color: string) => void;
  updateQuantity: (id: string, color: string, packs: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (newItem) => set((state) => {
        const existingItemIndex = state.items.findIndex(
          (item) => item.id === newItem.id && item.color === newItem.color
        );

        if (existingItemIndex > -1) {
          const newItems = [...state.items];
          newItems[existingItemIndex].packs += newItem.packs;
          return { items: newItems };
        }

        return { items: [...state.items, newItem] };
      }),
      removeItem: (id, color) => set((state) => ({
        items: state.items.filter((item) => !(item.id === id && item.color === color))
      })),
      updateQuantity: (id, color, packs) => set((state) => ({
        items: state.items.map((item) => 
          (item.id === id && item.color === color) ? { ...item, packs } : item
        )
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
