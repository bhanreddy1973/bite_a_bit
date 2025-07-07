'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type OrderCartItem = {
  id: string;
  name: string;
  count: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export default function NutritionInfoPage() {
  const router = useRouter();
  const [totals, setTotals] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [restaurantName, setRestaurantName] = useState<string>("");

  useEffect(() => {
    const restaurantName = localStorage.getItem('restaurantName') || '';
    setRestaurantName(restaurantName);
    const raw = localStorage.getItem('orderCart');
    if (!raw) return;
    const cart: OrderCartItem[] = JSON.parse(raw);
    const sum = cart.reduce((acc, item) => {
      acc.calories += item.calories * item.count;
      acc.carbs += item.carbs * item.count;
      acc.protein += item.protein * item.count;
      acc.fat += item.fat * item.count;
      return acc;
    }, { calories: 0, carbs: 0, protein: 0, fat: 0 });
    setTotals(sum);
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 pt-4 pb-24 text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">{restaurantName}</h1>
        <div className="text-xs text-right">
          <p className="text-gray-500">table code</p>
          {/* <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
            {JSON.parse(localStorage.getItem('userData') || '{}').tableCode}
          </span> */}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">Nutrition Info</h2>

      {/* Donut Chart */}
      <DonutChart {...totals} />

      {/* Legend with percentages */}
      <Legend carbs={totals.carbs} protein={totals.protein} fat={totals.fat} />

      {/* Verdict */}
      <p className="text-center text-gray-700 text-sm mt-4 px-4">
        {totals.protein / (totals.carbs + totals.protein + totals.fat) >= 0.3
          ? 'This meal has a great protein balance!'
          : 'Consider increasing your protein intake.'}
      </p>

      {/* Back Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => router.back()}
          className="bg-green-600 text-white px-6 py-2 rounded-full text-sm shadow"
        >
          Back
        </button>
      </div>

      {/* Floating bell */}
      <button className="fixed bottom-24 right-4 bg-green-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-xl">
        🔔
      </button>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
        <button className="flex flex-col items-center text-gray-700"><span>🏠</span><span className="text-[10px]">Home</span></button>
        <button className="flex flex-col items-center text-gray-700"><span>🍽️</span><span className="text-[10px]">Menu</span></button>
        <button className="flex flex-col items-center text-green-600 font-semibold"><span>🧾</span><span className="text-[10px]">Order</span></button>
      </div>
    </div>
  );
}

function DonutChart({
  calories,
  carbs,
  protein,
  fat
}: {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}) {
  const total = carbs + protein + fat;
  const carbPct = (carbs / total) * 100;
  const proteinPct = (protein / total) * 100;
  const fatPct = (fat / total) * 100;

  const r = 54;
  const C = 2 * Math.PI * r;

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full rotate-[-90deg]">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        {/* Carbs */}
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="12"
          strokeDasharray={`${(C * carbPct) / 100} ${C}`}
          strokeDashoffset={0}
          strokeLinecap="butt"
        />
        {/* Protein */}
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeDasharray={`${(C * proteinPct) / 100} ${C}`}
          strokeDashoffset={-(C * carbPct) / 100}
          strokeLinecap="butt"
        />
        {/* Fat */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke="#f97316"
          strokeWidth="12"
          strokeDasharray={`${(C * fatPct) / 100} ${C}`}
          strokeDashoffset={-(C * (carbPct + proteinPct)) / 100}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{calories}</span>
        <span className="text-sm text-gray-500">Total Calories</span>
      </div>
    </div>
  );
}

function Legend({ carbs, protein, fat }: { carbs: number; protein: number; fat: number }) {
  const total = carbs + protein + fat;
  const carbPct = (carbs / total) * 100;
  const proteinPct = (protein / total) * 100;
  const fatPct = 100 - carbPct - proteinPct;

  return (
    <div className="flex justify-center gap-6 mt-6 text-sm text-gray-700">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Carbs
        </div>
        <span className="text-xs mt-1">{carbPct.toFixed(0)}%</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span> Proteins
        </div>
        <span className="text-xs mt-1">{proteinPct.toFixed(0)}%</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span> Fats
        </div>
        <span className="text-xs mt-1">{fatPct.toFixed(0)}%</span>
      </div>
    </div>
  );
}
