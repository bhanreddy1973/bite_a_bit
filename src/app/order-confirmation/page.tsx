'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { collection, doc, setDoc } from "firebase/firestore";
// import { db } from "../../../firebase"; // Adjust path accordingly
// import { foodItems } from "@/data/foodItem";
import BottomNav from "../../components/BottomNav";

type OrderItem = {
  id: string;
  name: string;
  dish_type: string;
  count: number;
  addedBy: string;
  total: number;
  prep_time: number;
  status: string;
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const [items, setItems] = useState<OrderItem[]>([]);
const [restaurantName, setRestaurantName] = useState<string>("");

//   async function uploadMenu() {
//   const menuRef = collection(db, "restaurants", "bbq_in", "menu");

//   for (const item of foodItems) {
//     const docRef = doc(menuRef); // auto-generated ID
//     await setDoc(docRef, item);
//     console.log(`✅ Uploaded: ${item.name}`);
//   }  
// }

  useEffect(() => {
    const stored = localStorage.getItem('orderCart');
    const restaurantName = localStorage.getItem('restaurantName') || '';
    setRestaurantName(restaurantName);
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const firstItem = items[0];
  const arrivalTime = firstItem?.prep_time || 5;

  return (
    <div className="min-h-screen px-4 pt-4 pb-28 bg-white text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-base font-bold">{restaurantName}</h1>
        <div className="text-right text-xs">
          <p className="text-gray-500">table code</p>
          {/* <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-semibold text-sm">
            {JSON.parse(localStorage.getItem('userData') || '{}').tableCode}
          </span> */}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-center text-xl font-bold mt-4">Order Placed!</h2>
      <h3 className="text-center text-2xl font-bold my-1">{arrivalTime}</h3>
      <p className="text-center text-sm text-gray-700">
        for the starter{' '}
        <span className="text-green-700 font-semibold">{firstItem?.name}</span> to arrive
      </p>

      {/* Nutrition Button */}
      <div className="flex justify-center mt-3 mb-4">
        <button className="bg-green-600 text-white px-4 py-1.5 rounded-full text-sm shadow"  onClick={() => router.push("/nutrition-info")}>
          Check your Nutrition Balance!
        </button>
      </div>

      {/* All Items: Single-line cards */}
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center justify-between shadow-sm"
          >
            {/* Left: Name + metadata */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm whitespace-nowrap truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-600 whitespace-nowrap truncate mt-0.5">
                <span className="text-red-500">•</span> Added by {item.addedBy} |{' '}
                {item.status.toLowerCase()}
              </p>
            </div>

            {/* Center: prep_time */}
            <p className="text-xs font-bold whitespace-nowrap ml-2">
              {item.prep_time}
            </p>

            {/* More Info Button */}
            <button className="bg-green-600 text-white px-3 py-1 rounded-full text-xs ml-3">
              More info
            </button>
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <div className="flex justify-center mt-5">
        <button
          onClick={() => router.push('/menu')}
          className="px-5 py-2 rounded-full border text-sm text-gray-700 font-medium shadow-sm"
        >
          Add More
        </button>
      </div>

      {/* Bell Icon */}
      <button className="fixed bottom-24 right-4 bg-green-700 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-lg">
        🔔
      </button>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
        <button className="flex flex-col items-center text-gray-700">
          🏠<span className="text-[10px]">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-700">
          🍽️<span className="text-[10px]">Menu</span>
        </button>
        <button className="flex flex-col items-center text-green-600 font-semibold">
          🧾<span className="text-[10px]">Order</span>
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
