import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/stores/cartStore';
import { MenuItem } from '@/types/menu';

function createMockMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'item-1',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry',
    price: 350,
    image_url: '/images/butter-chicken.jpg',
    available: true,
    cuisine: 'Indian',
    dish_type: 'Main Course',
    meal_type: ['Lunch', 'Dinner'],
    diet: 'Non-Vegetarian',
    allergens: ['Dairy'],
    spice_level: 'Medium',
    taste_profile: ['Creamy', 'Spicy'],
    flavor_tags: ['Rich', 'Buttery'],
    ingredients: ['Chicken', 'Tomato', 'Butter', 'Cream'],
    calories: 450,
    carbs: 20,
    protein: 35,
    fat: 25,
    is_best_seller: true,
    rating: 4.5,
    review_count: 120,
    prep_time: '25 min',
    portion_size: 'Regular',
    serves: '1',
    cooking_method: 'Tandoor + Gravy',
    available_time: ['Lunch', 'Dinner'],
    occasion: ['Casual'],
    pairs_well_with: ['Naan', 'Rice'],
    combo_items: [],
    ...overrides,
  };
}

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  describe('addItem', () => {
    it('should add a new item to the cart with quantity 1', () => {
      const menuItem = createMockMenuItem();
      useCartStore.getState().addItem(menuItem);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].menuItem.id).toBe('item-1');
      expect(items[0].quantity).toBe(1);
      expect(items[0].subtotal).toBe(350);
    });

    it('should increment quantity when adding an existing item', () => {
      const menuItem = createMockMenuItem();
      useCartStore.getState().addItem(menuItem);
      useCartStore.getState().addItem(menuItem);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
      expect(items[0].subtotal).toBe(700);
    });

    it('should not add an unavailable item', () => {
      const menuItem = createMockMenuItem({ available: false });
      useCartStore.getState().addItem(menuItem);

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });

    it('should not exceed max quantity of 50 per item via addItem', () => {
      const menuItem = createMockMenuItem();
      useCartStore.setState({
        items: [{ menuItem, quantity: 50, subtotal: 350 * 50 }],
      });

      useCartStore.getState().addItem(menuItem);

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(50);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart by menuItemId', () => {
      const menuItem = createMockMenuItem();
      useCartStore.setState({
        items: [{ menuItem, quantity: 2, subtotal: 700 }],
      });

      useCartStore.getState().removeItem('item-1');

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });

    it('should not affect other items when removing one', () => {
      const item1 = createMockMenuItem({ id: 'item-1', name: 'Item 1' });
      const item2 = createMockMenuItem({ id: 'item-2', name: 'Item 2' });
      useCartStore.setState({
        items: [
          { menuItem: item1, quantity: 1, subtotal: 350 },
          { menuItem: item2, quantity: 1, subtotal: 350 },
        ],
      });

      useCartStore.getState().removeItem('item-1');

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(1);
      expect(items[0].menuItem.id).toBe('item-2');
    });
  });

  describe('increaseQuantity', () => {
    it('should increment the quantity by 1', () => {
      const menuItem = createMockMenuItem({ price: 200 });
      useCartStore.setState({
        items: [{ menuItem, quantity: 3, subtotal: 600 }],
      });

      useCartStore.getState().increaseQuantity('item-1');

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(4);
      expect(items[0].subtotal).toBe(800);
    });

    it('should not exceed max quantity of 50', () => {
      const menuItem = createMockMenuItem({ price: 100 });
      useCartStore.setState({
        items: [{ menuItem, quantity: 50, subtotal: 5000 }],
      });

      useCartStore.getState().increaseQuantity('item-1');

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(50);
      expect(items[0].subtotal).toBe(5000);
    });
  });

  describe('decreaseQuantity', () => {
    it('should decrement the quantity by 1', () => {
      const menuItem = createMockMenuItem({ price: 200 });
      useCartStore.setState({
        items: [{ menuItem, quantity: 3, subtotal: 600 }],
      });

      useCartStore.getState().decreaseQuantity('item-1');

      const { items } = useCartStore.getState();
      expect(items[0].quantity).toBe(2);
      expect(items[0].subtotal).toBe(400);
    });

    it('should remove item when quantity reaches zero', () => {
      const menuItem = createMockMenuItem();
      useCartStore.setState({
        items: [{ menuItem, quantity: 1, subtotal: 350 }],
      });

      useCartStore.getState().decreaseQuantity('item-1');

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      const item1 = createMockMenuItem({ id: 'item-1' });
      const item2 = createMockMenuItem({ id: 'item-2' });
      useCartStore.setState({
        items: [
          { menuItem: item1, quantity: 2, subtotal: 700 },
          { menuItem: item2, quantity: 1, subtotal: 350 },
        ],
      });

      useCartStore.getState().clearCart();

      const { items } = useCartStore.getState();
      expect(items).toHaveLength(0);
    });
  });

  describe('getTotalCount', () => {
    it('should return the sum of all item quantities', () => {
      const item1 = createMockMenuItem({ id: 'item-1' });
      const item2 = createMockMenuItem({ id: 'item-2' });
      useCartStore.setState({
        items: [
          { menuItem: item1, quantity: 2, subtotal: 700 },
          { menuItem: item2, quantity: 3, subtotal: 1050 },
        ],
      });

      expect(useCartStore.getState().getTotalCount()).toBe(5);
    });

    it('should return 0 for an empty cart', () => {
      expect(useCartStore.getState().getTotalCount()).toBe(0);
    });
  });

  describe('getTotalPrice', () => {
    it('should return the sum of all item subtotals', () => {
      const item1 = createMockMenuItem({ id: 'item-1', price: 350 });
      const item2 = createMockMenuItem({ id: 'item-2', price: 200 });
      useCartStore.setState({
        items: [
          { menuItem: item1, quantity: 2, subtotal: 700 },
          { menuItem: item2, quantity: 3, subtotal: 600 },
        ],
      });

      expect(useCartStore.getState().getTotalPrice()).toBe(1300);
    });

    it('should return 0 for an empty cart', () => {
      expect(useCartStore.getState().getTotalPrice()).toBe(0);
    });
  });

  describe('getItemsByCategory', () => {
    it('should group items by dish_type', () => {
      const item1 = createMockMenuItem({ id: 'item-1', dish_type: 'Main Course' });
      const item2 = createMockMenuItem({ id: 'item-2', dish_type: 'Appetizer' });
      const item3 = createMockMenuItem({ id: 'item-3', dish_type: 'Main Course' });
      useCartStore.setState({
        items: [
          { menuItem: item1, quantity: 1, subtotal: 350 },
          { menuItem: item2, quantity: 1, subtotal: 350 },
          { menuItem: item3, quantity: 1, subtotal: 350 },
        ],
      });

      const byCategory = useCartStore.getState().getItemsByCategory();
      expect(Object.keys(byCategory)).toHaveLength(2);
      expect(byCategory['Main Course']).toHaveLength(2);
      expect(byCategory['Appetizer']).toHaveLength(1);
    });

    it('should return an empty object for an empty cart', () => {
      const byCategory = useCartStore.getState().getItemsByCategory();
      expect(Object.keys(byCategory)).toHaveLength(0);
    });
  });
});
