"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from '../../../firebase'; // adjust import
import { collection, addDoc, Timestamp } from "firebase/firestore";
import BottomNav from "../../components/BottomNav";

type CartItem = {
  id: number;
  name: string;
  price: number;
  count: number;
  dish_type: string;
  addedBy: string;
};

export default function OrderSummary() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{
    userId:string;
    tableCode: number;
    userName: string;
  } | null>(null);
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState<string>("");
  
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const restaurantNameFromStorage = localStorage.getItem('restaurantName');
    if (!restaurantNameFromStorage) {
      alert("Restaurant not selected. Please start from the home page.");
      router.push("/");
      return;
    }
    setRestaurantName(restaurantNameFromStorage);
    if (storedUser) setUser(JSON.parse(storedUser));
    const storedCart = localStorage.getItem("orderCart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, [router]);

  const grouped = cart.reduce((acc, item) => {
    if (!acc[item.dish_type]) acc[item.dish_type] = [];
    acc[item.dish_type].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const increase = (id: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, count: item.count + 1 } : item
      );
      localStorage.setItem("orderCart", JSON.stringify(updated));
      return updated;
    });
  };

  // function addOrder(){
  //   console.log(grouped);
  // }
  async function addOrder() {
    if (!restaurantName) {
      alert("Restaurant not selected. Please start from the home page.");
      router.push("/");
      return;
    }
    try {
      console.log(grouped)
      const docRef = await addDoc(collection(db, "restaurants",restaurantName,"orders"), {
        ...grouped,
        userID: user?.userId,
        status: "pending",
        createdAt: Timestamp.now()
      });
      localStorage.setItem("orderId",docRef.id );
      localStorage.setItem("orderPlacedAt", Date.now().toString());
      router.push("/order-arrival")
      return docRef.id;
    } catch (e) {
      alert("Error placing order. Please try again later.");
      console.error("Error adding order: ", e);
      throw e;
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 pt-6 pb-32 text-gray-900">
      {/* Top Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="font-bold text-lg">{restaurantName}</h1>
          <h2 className="text-xl font-semibold mt-2">Order Summary</h2>
        </div>
        <div className="text-right text-sm">
          <p className="text-gray-600">table code</p>
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
            {user?.tableCode}
          </span>
          <br />
          <span className="font-semibold">👤 {user?.userName}</span>
        </div>
      </div>

      {/* Grouped Items */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="mb-6">
          <h3 className="text-md font-semibold mb-2">{category}</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-100 px-3 py-2 rounded-xl flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    🔴 Added by {item.addedBy}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-md">₹{item.price}</p>
                  <div className="mt-1 flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        const updated = cart
                          .map((i) =>
                            i.id === item.id ? { ...i, count: i.count - 1 } : i
                          )
                          .filter((i) => i.count > 0);
                        setCart(updated);
                        localStorage.setItem(
                          "orderCart",
                          JSON.stringify(updated)
                        );
                      }}
                      className="text-red-600 bg-red-100 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    >
                      −
                    </button>

                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center">
                      {item.count}
                    </span>

                    <button
                      onClick={() => increase(item.id)}
                      className="text-green-700 bg-green-100 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Action Buttons */}
      <div className="fixed bottom-16 left-0 right-0 px-4 flex justify-between">
        <button
          className="border border-gray-500 px-4 py-2 rounded-full text-sm"
          onClick={() => router.push("/menu")}
        >
          Add More
        </button>
        <button className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-medium" onClick={() => addOrder()}>
          Proceed to Order
        </button>
      </div>

      {/* Bell Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button className="bg-green-700 w-12 h-12 rounded-full text-white text-xl flex items-center justify-center shadow-lg">
          🔔
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-40">
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

      <BottomNav />
    </div>
  );
}


