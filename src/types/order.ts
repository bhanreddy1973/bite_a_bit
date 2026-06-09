export interface Order {
  id: string;
  userId: string;
  restaurantName: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served';
  createdAt: Date;
  totalPrice: number;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: 'preparing' | 'ready' | 'served';
  prepTime: string;
  addedBy: string;
}
