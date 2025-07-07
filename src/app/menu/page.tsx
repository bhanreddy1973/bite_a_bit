"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
// import { foodItems } from "@/data/foodItem";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase"; // Adjust path accordingly
import { FaBell } from 'react-icons/fa';
import BottomNav from "../../components/BottomNav";
import BannerCarousel from "../../components/BannerCarousel";
import SwipeablePanels from "../../components/SwipeablePanels";

type CartItem = {
  id: string;
  name: string;
  price: number;
  dish_type: string;
  count: number;
  status: string;
  addedBy: string;
  total: number;
  customization?: string;
  prep_time?: string;
  calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
};

export default function MenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    userID:string;
    tableCode: number;
    userName: string;
  } | null>(null);

  type MenuItem = {
    id: string;
    name: string;
    price: number;
    dish_type: string;
    spicy: boolean;
    rating: number;
    count?: number;
    status?: string;
    customization?: string;
    calories?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
    addedBy?: string;
    total?: number;
    prep_time?: string; // Assuming this is the preparation time
    image?: string;
    cuisine?: string;
    ingredients?: string;
    allergens?: string;
  };
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All"); // default to 'All'
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [cart, setCart] = useState<Record<string, CartItem>>({});

  const [selectedSort, setSelectedSort] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(false);

  // Categories for swipeable panels
  const categories = ["All", "Starters", "Main Course", "Dessert"];
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const addTimeoutRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
    const stored = localStorage.getItem("userData");
    const restaurantNameFromStorage = localStorage.getItem("restaurantName");
    if (!restaurantNameFromStorage) {
      // Professional user-friendly warning and redirect
      alert("Restaurant not selected. Please start from the home page.");
      router.push("/");
      return;
    }
    if (stored) setUser(JSON.parse(stored));
  
    const fetchMenu = async () => {
      try {
        const menuRef = collection(db, "restaurants", restaurantNameFromStorage, "menu");
        const snapshot = await getDocs(menuRef);
        const items: MenuItem[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            price: data.price,
            dish_type: data.dish_type,        
            spicy: data.spicy,
            rating: data.rating,
            prep_time:data.prep_time,
            calories: data.calories || 0, // optional
            carbs: data.carbs || 0, // optional
            protein: data.protein || 0, // optional
            fat: data.fat || 0, // optional
            customization: data.customization || "", // optional
          };
        });
        setMenuItems(items);
      } catch (error) {
        alert("Error fetching menu. Please try again later.");
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();

    const storedCart = localStorage.getItem("orderCart");
  if (storedCart) {
    const parsed = JSON.parse(storedCart) as CartItem[];
    const cartMap: Record<number, CartItem> = Object.fromEntries(
      parsed.map((item) => [item.id, item])
    );
    setCart(cartMap);
  }
  }, [router]);

  useEffect(() => {
    setExpandedItemId(null);
  }, [activePanelIndex, selectedCategory, router]);

  // const visibleItems =
  //   selectedCategory === "All"
  //     ? menuItems
  //     : menuItems.filter((item) => item.dish_type === selectedCategory);

      // type IncomingItem = Omit<CartItem, 'count' | 'addedBy' | 'total'>;
//  const increaseItem = (item: IncomingItem) => {
//   setCart((prev) => {
//     const existing = prev[item.id];
//     const count = existing ? existing.count + 1 : 1;
//     console.log(user?.userName)
//     const updated: Record<number, CartItem> = {
//       ...prev,      
//       [item.id]: {        
//         id: item.id,
//         name: item.name,
//         price: item.price,
//         dish_type: item.dish_type,
//         count,
//         status:"ordered",
//         customization: item.customization || "",
//         addedBy: user?.userName || "Guest",
//         total: item.price * count,
//       },
//     };

//     localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
//     return updated;
//   });
// };

const increaseItem = (item: MenuItem) => {
  if (!user) {
    alert('User not loaded yet. Please wait.');
    return;
  }
  setCart(prev => {
    const existing = prev[item.id];
    const count = existing ? existing.count + 1 : 1;
    const name = item.name;
    const price = item.price;
    const dish_type = item.dish_type;
    const addedBy = user.userName;
    const calories = item.calories || 0; // optional
    const carbs = item.carbs || 0; // optional  
    const protein = item.protein || 0; // optional
    const fat = item.fat || 0; // optional
    const prep_time = item?.prep_time; // Assuming time is the preparation time
    const updated: Record<string, CartItem> = {
      ...prev,
      [item.id]: {
        id: item.id,
        name,
        price,
        dish_type,
        count,
        status: "ordered",
        prep_time,
        addedBy,
        calories,
        carbs,
        protein,
        fat,
        total: price * count,
        customization: existing?.customization || ""
      }
    };
    localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
    return updated;
  });
};


//   const decreaseItem = (item: IncomingItem) => {
//   setCart((prev) => {
//     const existing = prev[item.id];
//     if (!existing || existing.count <= 1) {
//       const newCart = { ...prev };
//       delete newCart[item.id];
//       localStorage.setItem("orderCart", JSON.stringify(Object.values(newCart)));
//       return newCart;
//     }

//     const count = existing.count - 1;

//     const updated: Record<number, CartItem> = {
//       ...prev,
//       [item.id]: {
//         ...existing,
//         count,
//         total: item.price * count,
//       },
//     };

//     localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
//     return updated;
//   });
// };



// const decreaseItem = (item: MenuItem) => {
//   setCart((prev) => {
//     const existing = prev[item.id];
//     if (!existing || existing.count <= 1) {
//       const newCart = { ...prev };
//       delete newCart[item.id];
//       localStorage.setItem("orderCart", JSON.stringify(Object.values(newCart)));
//       return newCart;
//     }

//     const count = existing.count - 1;

//     const updated: Record<string, CartItem> = {
//       ...prev,
//       [item.id]: {
//         ...existing,
//         count,
//         total: item.price * count,
//       },
//     };

//     localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
//     return updated;
//   });
// };


  // const handleCustomization = (id: string, value: string) => {
  //   setCart((prev) => {
  //     if (!prev[id]) return prev;
  //     const updated = {
  //       ...prev,
  //       [id]: {
  //         ...prev[id],
  //         customization: value,
  //       },
  //     };
  //     localStorage.setItem("orderCart", JSON.stringify(Object.values(updated)));
  //     return updated;
  //   });
  // };

  // New: Find the expanded item object
  // const expandedItem = expandedItemId ? visibleItems.find(item => item.id === expandedItemId) : null;
  // const compactItems = expandedItemId
  //   ? visibleItems.filter(item => item.id !== expandedItemId)
  //   : visibleItems;

  const handleAdd = (item: MenuItem) => {
    increaseItem(item);
    setJustAddedId(item.id);
    if (addTimeoutRef.current) clearTimeout(addTimeoutRef.current);
    addTimeoutRef.current = setTimeout(() => {
      setJustAddedId(null);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">
        Loading user data...
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-white pb-32">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xl"><img width="24" height="24" src="https://img.icons8.com/ios/50/marker--v1.png" alt="marker--v1"/></span>
            <span className="font-bold text-xl text-gray-900">{localStorage.getItem('restaurantName') || 'BBQ Inn'}</span>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold text-gray-900">table code</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold ml-1 text-base">{user?.tableCode || '----'}</span>
            <br />
            <span className="font-semibold text-sm text-gray-900 flex items-center gap-1"><span className="text-lg">👤</span>{user?.userName || 'Guest'}</span>
          </div>
        </div>

        {/* Banner/Carousel - always visible at the top, scrolls away naturally */}
        <BannerCarousel />

        {/* Section Title */}
        <h2 className="text-2xl font-extrabold text-gray-900 mt-6 mb-3 px-4">Start adding your meals!</h2>

        {/* Place this above the SwipeablePanels */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            margin: '0 auto 8px auto',
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            padding: '6px 0',
            paddingLeft: 16,
            paddingRight: 16,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 8.93,
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
          className="hide-scrollbar"
        >
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setActivePanelIndex(idx);
              }}
              style={{
                minWidth: 94,
                height: 32,
                padding: '0 18px',
                borderRadius: idx === 0 ? '8px 4.46px 4.46px 8px' : 4.46,
                border: selectedCategory === cat ? 'none' : '0.89px solid #000',
                background: selectedCategory === cat ? '#15803D' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#18181B',
                fontWeight: selectedCategory === cat ? 700 : 400,
                fontSize: 15,
                fontFamily: 'Outfit, sans-serif',
                lineHeight: '100%',
                letterSpacing: 0,
                textAlign: 'center',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: selectedCategory === cat ? '0 0 0 2px #15803D' : 'none',
                transition: 'background 0.2s, color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                marginRight: 0,
                marginLeft: 0,
                userSelect: 'none',
              }}
              tabIndex={0}
              aria-pressed={selectedCategory === cat}
            >
              {cat}
            </button>
          ))}
          {/* Sort Icon Button */}
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: `0.89px solid ${selectedSort ? '#FFA500' : '#000'}`,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'pointer',
              transition: 'border 0.2s',
              marginLeft: 0,
              marginRight: 0,
              scrollSnapAlign: 'center',
            }}
            title="Sort"
            onClick={e => { e.stopPropagation(); setSelectedSort(s => !s); }}
            tabIndex={0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="2.5" rx="1" fill="#000"/>
              <rect x="3" y="17.5" width="18" height="2.5" rx="1" fill="#000"/>
              <path d="M12 7.5L16 12H8L12 7.5Z" fill="#000"/>
            </svg>
          </button>
          {/* Filter Icon Button */}
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: `0.89px solid ${selectedFilter ? '#FFA500' : '#000'}`,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              cursor: 'pointer',
              transition: 'border 0.2s',
              marginLeft: 0,
              marginRight: 0,
              scrollSnapAlign: 'center',
            }}
            title="Filter"
            onClick={e => { e.stopPropagation(); setSelectedFilter(f => !f); }}
            tabIndex={0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="2.5" rx="1" fill="#000"/>
              <rect x="6" y="11" width="12" height="2.5" rx="1" fill="#000"/>
              <rect x="9" y="16" width="6" height="2.5" rx="1" fill="#000"/>
            </svg>
          </button>
        </div>

        {/* Hide scrollbar cross-browser */}
        <style jsx global>{`
          .hide-scrollbar {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none !important;
          }
        `}</style>

        {/* SwipeablePanels for menu content only */}
        <SwipeablePanels
          currentIndex={activePanelIndex}
          style={{ height: 'auto', minHeight: '400px' }}
          onPanelChange={(index) => {
            setActivePanelIndex(index);
            setSelectedCategory(categories[index]);
          }}
        >
          {categories.map((category) => (
            <div key={category} style={{ padding: '0 16px' }}>
              {/* Menu Items for this category */}
              <div className="space-y-6 flex flex-col items-center">
                {(category === "All" 
                  ? menuItems 
                  : menuItems.filter((item) => item.dish_type === category)
                ).map((item) => (
                  <div
                    key={item.id}
                    className={`bg-[#FAFAFA] rounded-2xl flex items-center justify-between shadow transition-all duration-300 overflow-hidden ${expandedItemId === item.id ? 'ring-2 ring-green-600' : ''} ${justAddedId === item.id ? 'added-card-animate' : ''}`}
                    onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                    style={{
                      cursor: 'pointer',
                      width: expandedItemId === item.id ? 388 : 388,
                      minHeight: expandedItemId === item.id ? 329 : 65,
                      borderBottomRightRadius: 10,
                      borderBottomLeftRadius: 10,
                      paddingBottom: expandedItemId === item.id ? 10 : 15,
                      paddingTop: expandedItemId === item.id ? 0 : 15,
                      paddingRight: expandedItemId === item.id ? 0 : 8,
                      paddingLeft: expandedItemId === item.id ? 0 : 8,
                      gap: 13,
                      margin: '0 auto',
                      borderRadius: 10,
                      boxSizing: 'border-box',
                      fontFamily: 'Outfit, sans-serif',
                      background: justAddedId === item.id ? '#DBEAFE' : '#FAFAFA',
                      border: justAddedId === item.id ? '2px solid #2563EB' : 'none',
                      boxShadow: justAddedId === item.id ? '0 4px 24px 0 rgba(37,99,235,0.10)' : '0 2px 8px rgba(0,0,0,0.03)',
                      transform: justAddedId === item.id ? 'scale(1.03)' : 'scale(1)',
                      transition: 'background 0.5s, border 0.5s, box-shadow 0.5s, transform 0.3s',
                    }}
                  >
                    {expandedItemId === item.id ? (
                      <>
                        {/* Expanded: Large image at top, not stretched */}
                        <div style={{ width: 388, height: 180, borderTopLeftRadius: 10, borderTopRightRadius: 10, overflow: 'hidden', background: '#eee' }}>
                          <img
                            src={item.image || '/banner.jpg'}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                        <div style={{ padding: '0 16px 5px 16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 313, height: 35, margin: '10px 0 0 0' }}>
                            <div style={{ fontWeight: 700, fontSize: 20, color: '#18181B', fontFamily: 'Outfit, sans-serif' }}>{item.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 20, color: '#18181B', fontFamily: 'Outfit, sans-serif' }}>₹{item.price}</span>
                              <button
                                className={justAddedId === item.id ? '' : 'bg-green-600 text-white'}
                                style={{
                                  width: 84,
                                  height: 35,
                                  fontSize: 18,
                                  fontWeight: 700,
                                  fontFamily: 'Outfit, sans-serif',
                                  borderRadius: 9999,
                                  background: justAddedId === item.id
                                    ? 'linear-gradient(90deg, #FFD700 0%, #FFECB3 100%)'
                                    : '#15803D',
                                  color: justAddedId === item.id ? '#2563EB' : '#fff',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 6,
                                  boxShadow: justAddedId === item.id ? '0 2px 8px 0 #FFD70044' : 'none',
                                  transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
                                }}
                                onClick={e => { e.stopPropagation(); handleAdd(item); }}
                                disabled={justAddedId === item.id}
                              >
                                {justAddedId === item.id ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563EB" style={{ width: 22, height: 22 }}>
                                      <circle cx="12" cy="12" r="10" fill="#fff" stroke="#2563EB" strokeWidth="2" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" stroke="#22C55E" strokeWidth="2.5" />
                                    </svg>
                                    <span style={{ fontWeight: 700 }}>Added</span>
                                  </>
                                ) : 'Add'}
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', width: 313, height: 35, justifyContent: 'space-between', fontSize: 13, color: '#52525B', fontFamily: 'Outfit, sans-serif', fontWeight: 500, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>{item.prep_time || '18 mins'}</span>
                              <span>• {item.spicy ? 'Spicy' : 'Mild'}</span>
                              <span>• {item.cuisine || 'Indian'}</span>
                              <span>• 2 serves</span>
                              <span>• {item.rating || '4.5'} <span style={{ color: '#FACC15' }}>★</span></span>
                            </div>
                          </div>
                          <div style={{ width: 340, height: 50, fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 8, lineHeight: '100%', letterSpacing: 0, color: '#18181B', marginBottom: 6 }}>
                            Aromatic {item.name} infused with fragrant spices. Read more...<br />
                            Ingredients: {item.ingredients || 'Basmati rice, chicken, onions, tomatoes, yogurt, ginger, garlic, biryani masala, mint, coriander.'}<br />
                            Allergen Info: {item.allergens || 'Dairy, gluten (if served with naan), nuts (optional garnish).'}<br />
                            A flavorful, layered rice dish inspired by traditional Indian kitchens.
                          </div>
                        </div>
                      </>
                    ) : (
                      // Compact: No image, single row, Figma style
                      <div style={{ display: 'flex', alignItems: 'center', width: 388, height: 65, padding: '15px 8px', gap: 13 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 20, color: '#18181B', fontFamily: 'Outfit, sans-serif', marginBottom: 2 }}>{item.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#52525B', fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }}></span>{item.prep_time || '18 mins'}</span>
                            <span>• {item.spicy ? 'Spicy' : 'Mild'}</span>
                            <span>• {item.rating || '4.5'} <span style={{ color: '#FACC15' }}>★</span></span>
                            <span>• 2 serves</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 90, gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 20, color: '#18181B', fontFamily: 'Outfit, sans-serif' }}>₹{item.price}</span>
                          <button
                            className={justAddedId === item.id ? '' : 'bg-green-600 text-white'}
                            style={{
                              width: 84,
                              height: 35,
                              fontSize: 18,
                              fontWeight: 700,
                              fontFamily: 'Outfit, sans-serif',
                              borderRadius: 9999,
                              background: justAddedId === item.id
                                ? 'linear-gradient(90deg, #FFD700 0%, #FFECB3 100%)'
                                : '#15803D',
                              color: justAddedId === item.id ? '#2563EB' : '#fff',
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                              boxShadow: justAddedId === item.id ? '0 2px 8px 0 #FFD70044' : 'none',
                              transition: 'background 0.3s, color 0.3s, box-shadow 0.3s',
                            }}
                            onClick={e => { e.stopPropagation(); handleAdd(item); }}
                            disabled={justAddedId === item.id}
                          >
                            {justAddedId === item.id ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563EB" style={{ width: 22, height: 22 }}>
                                  <circle cx="12" cy="12" r="10" fill="#fff" stroke="#2563EB" strokeWidth="2" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" stroke="#22C55E" strokeWidth="2.5" />
                                </svg>
                                <span style={{ fontWeight: 700 }}>Added</span>
                              </>
                            ) : 'Add'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </SwipeablePanels>

        {/* Floating Bell Button */}
        <div className="fixed bottom-20 right-4 z-50">
          <button className="bg-green-700 w-12 h-12 rounded-full text-white text-xl flex items-center justify-center shadow-lg" title="Notifications">
            <FaBell />
          </button>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />

        {/* Sticky Order Summary Bar */}
        <div className="fixed bottom-16 left-0 right-0 flex justify-center z-50">
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              margin: '0 auto',
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'stretch',
              padding: '12px 18px',
              gap: 12,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {/* Left: Order Summary and categories */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#18181B', marginBottom: 4 }}>
                Order Summary
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                {(() => {
                  // Group cart items by dish_type and sum their totals
                  const categoryTotals = Object.values(cart).reduce((acc, item) => {
                    if (!acc[item.dish_type]) acc[item.dish_type] = 0;
                    acc[item.dish_type] += item.total;
                    return acc;
                  }, {} as Record<string, number>);
                  const entries = Object.entries(categoryTotals);
                  return entries.map(([cat, price]) => (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: '#18181B', lineHeight: 1 }}>{price > 0 ? `₹${price}` : ''}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#52525B', marginTop: 2, lineHeight: 1 }}>{cat}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
            {/* Right: Order button and Total */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', minWidth: 110, gap: 8 }}>
              <button
                style={{
                  background: '#15803D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 18,
                  padding: '8px 22px',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: '0 1px 4px 0 rgba(21,128,61,0.10)',
                  transition: 'background 0.2s',
                }}
                onClick={() => router.push('/order-summary')}
              >
                Order
              </button>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#18181B', textAlign: 'right' }}>
                Total <span style={{ fontWeight: 800 }}>₹{Object.values(cart).reduce((acc, item) => acc + item.total, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
