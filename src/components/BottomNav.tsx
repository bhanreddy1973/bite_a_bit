import { useRouter, usePathname } from "next/navigation";
import { FaHome, FaUtensils, FaReceipt } from "react-icons/fa";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-40 max-w-md mx-auto">
      <button
        className={`flex flex-col items-center ${pathname === "/" ? "text-green-600 font-semibold" : "text-gray-700"}`}
        onClick={() => router.push("/")}
      >
        <FaHome className="text-2xl" />
        <span className="text-xs">Home</span>
      </button>
      <button
        className={`flex flex-col items-center ${pathname === "/menu" ? "text-green-600 font-semibold" : "text-gray-700"}`}
        onClick={() => router.push("/menu")}
      >
        <FaUtensils className="text-2xl" />
        <span className="text-xs">Menu</span>
      </button>
      <button
        className={`flex flex-col items-center ${pathname === "/order-summary" ? "text-green-600 font-semibold" : "text-gray-700"}`}
        onClick={() => router.push("/order-summary")}
      >
        <FaReceipt className="text-2xl" />
        <span className="text-xs">Order</span>
      </button>
    </div>
  );
} 