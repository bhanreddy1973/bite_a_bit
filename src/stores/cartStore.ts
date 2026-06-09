import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem } from '@/types/cart';
import { MenuItem } from '@/types/menu';

const MAX_QUANTITY_PER_ITEM = 50;

interface CartStore {
  items: CartItem[];

  // Derived selectors
  getTotalCount: () => number;
  getTotalPrice: () => number;
  getItemsByCategory: () => Record<string, CartItem[]>;

  // Actions
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  increaseQuantity: (menuItemId: string) => void;
  decreaseQuantity: (menuItemId: string) => void;
  clearCart: () => void;
}

function isValidCartItems(items: unknown): items is CartItem[] {
  if (!Array.isArray(items)) return false;
  return items.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      item.quantity <= MAX_QUANTITY_PER_ITEM &&
      typeof item.subtotal === 'number' &&
      item.menuItem &&
      typeof item.menuItem === 'object' &&
      typeof item.menuItem.id === 'string' &&
      typeof item.menuItem.name === 'string' &&
      typeof item.menuItem.price === 'number',
  );
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      getTotalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0);
      },

      getItemsByCategory: () => {
        return get().items.reduce(
          (acc, item) => {
            const category = item.menuItem.dish_type || 'Other';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(item);
            return acc;
          },
          {} as Record<string, CartItem[]>,
        );
      },

      addItem: (menuItem: MenuItem) => {
        if (!menuItem.available) {
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.menuItem.id === menuItem.id);

          if (existingIndex >= 0) {
            const existing = state.items[existingIndex];
            if (existing.quantity >= MAX_QUANTITY_PER_ITEM) {
              return state;
            }
            const newQuantity = existing.quantity + 1;
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...existing,
              quantity: newQuantity,
              subtotal: menuItem.price * newQuantity,
            };
            return { items: updatedItems };
          }

          const newItem: CartItem = {
            menuItem,
            quantity: 1,
            subtotal: menuItem.price,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (menuItemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== menuItemId),
        }));
      },

      increaseQuantity: (menuItemId: string) => {
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item.menuItem.id === menuItemId) {
              if (item.quantity >= MAX_QUANTITY_PER_ITEM) {
                return item;
              }
              const newQuantity = item.quantity + 1;
              return {
                ...item,
                quantity: newQuantity,
                subtotal: item.menuItem.price * newQuantity,
              };
            }
            return item;
          });
          return { items: updatedItems };
        });
      },

      decreaseQuantity: (menuItemId: string) => {
        set((state) => {
          const item = state.items.find((i) => i.menuItem.id === menuItemId);
          if (!item) return state;

          if (item.quantity <= 1) {
            return {
              items: state.items.filter((i) => i.menuItem.id !== menuItemId),
            };
          }

          const updatedItems = state.items.map((i) => {
            if (i.menuItem.id === menuItemId) {
              const newQuantity = i.quantity - 1;
              return {
                ...i,
                quantity: newQuantity,
                subtotal: i.menuItem.price * newQuantity,
              };
            }
            return i;
          });
          return { items: updatedItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'bite-a-bit-cart',
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartStore> | null;
        if (!persisted || !isValidCartItems(persisted.items)) {
          return { ...currentState, items: [] };
        }
        return { ...currentState, items: persisted.items };
      },
    },
  ),
);
