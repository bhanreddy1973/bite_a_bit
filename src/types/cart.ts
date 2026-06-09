import { MenuItem } from './menu';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  subtotal: number; // computed: price * quantity
}

export interface CartState {
  items: CartItem[];
  totalCount: number; // computed: sum of quantities
  totalPrice: number; // computed: sum of subtotals
}
