import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cartStore';
import { MenuItem } from '@/types/menu';

/**
 * **Validates: Requirements 6.2, 6.3, 14.1**
 *
 * Property 1: Cart Total Integrity
 * totalPrice always equals sum of (item.price × item.quantity) for all items
 * after any sequence of add/remove/increase/decrease operations.
 * totalCount always equals sum of all item.quantity values.
 */

function createMenuItem(id: string, price: number): MenuItem {
  return {
    id,
    name: `Item ${id}`,
    description: `Description for ${id}`,
    price,
    image_url: `/images/${id}.jpg`,
    available: true,
    cuisine: 'Indian',
    dish_type: 'Main Course',
    meal_type: ['Lunch'],
    diet: 'Vegetarian',
    allergens: [],
    spice_level: 'Medium',
    taste_profile: ['Spicy'],
    flavor_tags: ['Rich'],
    ingredients: ['Ingredient A'],
    calories: 300,
    carbs: 30,
    protein: 20,
    fat: 15,
    is_best_seller: false,
    rating: 4.0,
    review_count: 50,
    prep_time: '15 min',
    portion_size: 'Regular',
    serves: '1',
    cooking_method: 'Grilled',
    available_time: ['Lunch', 'Dinner'],
    occasion: ['Casual'],
    pairs_well_with: [],
    combo_items: [],
  };
}

type CartOperation =
  | { type: 'add'; item: MenuItem }
  | { type: 'remove'; itemId: string }
  | { type: 'increase'; itemId: string }
  | { type: 'decrease'; itemId: string };

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function generateRandomOperations(
  random: () => number,
  menuItems: MenuItem[],
  count: number
): CartOperation[] {
  const operations: CartOperation[] = [];

  for (let i = 0; i < count; i++) {
    const opType = Math.floor(random() * 4);
    const itemIndex = Math.floor(random() * menuItems.length);
    const item = menuItems[itemIndex];

    switch (opType) {
      case 0:
        operations.push({ type: 'add', item });
        break;
      case 1:
        operations.push({ type: 'remove', itemId: item.id });
        break;
      case 2:
        operations.push({ type: 'increase', itemId: item.id });
        break;
      case 3:
        operations.push({ type: 'decrease', itemId: item.id });
        break;
    }
  }

  return operations;
}

function executeOperation(op: CartOperation): void {
  const store = useCartStore.getState();
  switch (op.type) {
    case 'add':
      store.addItem(op.item);
      break;
    case 'remove':
      store.removeItem(op.itemId);
      break;
    case 'increase':
      store.increaseQuantity(op.itemId);
      break;
    case 'decrease':
      store.decreaseQuantity(op.itemId);
      break;
  }
}

function assertCartTotalIntegrity(operationIndex: number): void {
  const state = useCartStore.getState();

  // Property: totalPrice === sum of (item.menuItem.price * item.quantity)
  const expectedTotalPrice = state.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );
  expect(state.getTotalPrice()).toBe(expectedTotalPrice);

  // Property: totalCount === sum of all item.quantity
  const expectedTotalCount = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  expect(state.getTotalCount()).toBe(expectedTotalCount);

  // Property: each item's subtotal === item.menuItem.price * item.quantity
  for (const item of state.items) {
    expect(item.subtotal).toBe(item.menuItem.price * item.quantity);
  }

  // Property: all quantities are positive (items with 0 quantity should be removed)
  for (const item of state.items) {
    expect(item.quantity).toBeGreaterThan(0);
  }
}

describe('cartStore - Property: Cart Total Integrity', () => {
  const menuItems: MenuItem[] = [
    createMenuItem('item-1', 150),
    createMenuItem('item-2', 299),
    createMenuItem('item-3', 450),
    createMenuItem('item-4', 75),
    createMenuItem('item-5', 1200),
  ];

  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should maintain total integrity across 100 random operation sequences (50 ops each)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      // Reset cart for each sequence
      useCartStore.setState({ items: [] });

      const random = seededRandom(seed);
      const operations = generateRandomOperations(random, menuItems, 50);

      for (let i = 0; i < operations.length; i++) {
        executeOperation(operations[i]);
        assertCartTotalIntegrity(i);
      }
    }
  });

  it('should maintain total integrity with rapid add/remove cycles', () => {
    for (let seed = 200; seed <= 250; seed++) {
      useCartStore.setState({ items: [] });

      const random = seededRandom(seed);

      // Generate operations biased toward add/remove for stress testing
      for (let i = 0; i < 30; i++) {
        const opType = random() < 0.6 ? 'add' : 'remove';
        const itemIndex = Math.floor(random() * menuItems.length);
        const item = menuItems[itemIndex];

        if (opType === 'add') {
          executeOperation({ type: 'add', item });
        } else {
          executeOperation({ type: 'remove', itemId: item.id });
        }
        assertCartTotalIntegrity(i);
      }
    }
  });

  it('should maintain total integrity with heavy increase/decrease sequences', () => {
    for (let seed = 300; seed <= 350; seed++) {
      useCartStore.setState({ items: [] });

      const random = seededRandom(seed);

      // First add some items
      for (let i = 0; i < 3; i++) {
        const itemIndex = Math.floor(random() * menuItems.length);
        executeOperation({ type: 'add', item: menuItems[itemIndex] });
      }

      // Then perform many increase/decrease operations
      for (let i = 0; i < 40; i++) {
        const opType = random() < 0.5 ? 'increase' : 'decrease';
        const itemIndex = Math.floor(random() * menuItems.length);
        const item = menuItems[itemIndex];

        executeOperation({ type: opType, itemId: item.id });
        assertCartTotalIntegrity(i);
      }
    }
  });

  it('should maintain total integrity when operating on non-existent items', () => {
    for (let seed = 400; seed <= 450; seed++) {
      useCartStore.setState({ items: [] });

      const random = seededRandom(seed);
      const allIds = [...menuItems.map((m) => m.id), 'nonexistent-1', 'nonexistent-2'];

      for (let i = 0; i < 30; i++) {
        const opType = Math.floor(random() * 4);
        const itemIndex = Math.floor(random() * menuItems.length);
        const idIndex = Math.floor(random() * allIds.length);

        switch (opType) {
          case 0:
            executeOperation({ type: 'add', item: menuItems[itemIndex] });
            break;
          case 1:
            executeOperation({ type: 'remove', itemId: allIds[idIndex] });
            break;
          case 2:
            executeOperation({ type: 'increase', itemId: allIds[idIndex] });
            break;
          case 3:
            executeOperation({ type: 'decrease', itemId: allIds[idIndex] });
            break;
        }
        assertCartTotalIntegrity(i);
      }
    }
  });

  it('should maintain total integrity with items at various price points', () => {
    const priceVariants: MenuItem[] = [
      createMenuItem('cheap-1', 1),
      createMenuItem('cheap-2', 10),
      createMenuItem('mid-1', 500),
      createMenuItem('expensive-1', 9999),
      createMenuItem('expensive-2', 50000),
    ];

    for (let seed = 500; seed <= 550; seed++) {
      useCartStore.setState({ items: [] });

      const random = seededRandom(seed);
      const operations = generateRandomOperations(random, priceVariants, 40);

      for (let i = 0; i < operations.length; i++) {
        executeOperation(operations[i]);
        assertCartTotalIntegrity(i);
      }
    }
  });
});
