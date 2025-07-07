'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

// CartItem type as in menu/order-summary
interface CartItem {
  id: string;
  name: string;
  price: number;
  count: number;
  dish_type: string;
  addedBy: string;
}

export default function OrderArrival() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ userName: string; tableCode: number } | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");

  useEffect(() => {
    const storedCart = localStorage.getItem("orderCart");
    setCart(storedCart ? JSON.parse(storedCart) : []);
    const storedUser = localStorage.getItem("userData");
    setUser(storedUser ? JSON.parse(storedUser) : null);
    const restaurantNameFromStorage = localStorage.getItem("restaurantName");
    setRestaurantName(restaurantNameFromStorage || "");
  }, []);

  // Group by dish_type for display (optional, but Figma shows all in one list)
  // const grouped = cart.reduce((acc, item) => {
  //   if (!acc[item.dish_type]) acc[item.dish_type] = [];
  //   acc[item.dish_type].push(item);
  //   return acc;
  // }, {} as Record<string, CartItem[]>);

  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-32 text-gray-900">
      {/* Top Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl"><img width="24" height="24" src="https://img.icons8.com/ios/50/marker--v1.png" alt="marker--v1"/></span>
          <h1 className="font-bold text-xl text-black">{restaurantName || 'BBQ Inn'}</h1>
        </div>
        <div className="text-right text-xs">
          <span className="font-bold text-gray-900">table code</span>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold ml-1 text-base">{user?.tableCode || '----'}</span>
          <br />
          <span className="font-semibold text-sm text-gray-900 flex items-center gap-1">👤{user?.userName || 'Guest'}</span>
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mt-2 mb-4">Order Arrival</h2>

      {/* Cart Items List */}
      <div className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 mt-12 text-lg font-semibold">
            No items in your order yet.
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-[#FAFAFA] rounded-2xl flex items-center justify-between px-4 py-3 shadow"
              style={{ minHeight: 64 }}
            >
              <div className="flex items-center gap-3">
                {/* Drag dots icon */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="4" cy="5" r="1.5" fill="#18181B"/>
                  <circle cx="4" cy="9" r="1.5" fill="#18181B"/>
                  <circle cx="4" cy="13" r="1.5" fill="#18181B"/>
                  <circle cx="9" cy="5" r="1.5" fill="#18181B"/>
                  <circle cx="9" cy="9" r="1.5" fill="#18181B"/>
                  <circle cx="9" cy="13" r="1.5" fill="#18181B"/>
                </svg>
                <div>
                  <div className="font-bold text-lg text-black">{item.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block"></span>
                    <span className="text-xs text-gray-600 font-semibold">{item.dish_type}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-lg text-black">₹{item.price}</span>
                <span className="text-lg font-bold text-gray-700">× {item.count}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-6">
        <button
          onClick={() => router.push('/menu')}
          className="px-6 py-2 rounded-full border text-gray-700 font-semibold text-lg bg-white"
        >
          Add More
        </button>
        <button
          onClick={() => router.push('/order-confirmation')}
          className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold text-lg"
        >
          Place Order
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
        <button className="flex flex-col items-center text-green-600 font-semibold">
          🏠<span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-700">
          🍽️<span className="text-xs">Menu</span>
        </button>
        <button className="flex flex-col items-center text-gray-700">
          🧾<span className="text-xs">Order</span>
        </button>
      </div>
    </div>
  );
}
