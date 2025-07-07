'use client';
import { useRouter } from 'next/navigation';
import { useEffect,useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // adjust path based on your structure
// import { authenticateUser } from '@utils/authService';
// import { db } from '../../firebase';
// import { collection, getDocs } from 'firebase/firestore';
import BottomNav from "../components/BottomNav";


export default function Home() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState<string>("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    let restaurantName = urlParams.get('restaurant_name');
    const table = urlParams.get('table');
    if (!restaurantName) restaurantName = 'bbq_in';
    localStorage.setItem('restaurantName', restaurantName); // Default to 'bbq_in' if not found
    setRestaurantName(restaurantName);
    localStorage.setItem('tableNo', table || '');
    console.log('Restaurant ID:', restaurantName);
    console.log('Table:', table);
  }, []);
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Store user in Firestore
      const docRef = await addDoc(collection(db, 'users'), {
        name,
        phone,
        createdAt: new Date()
      });

      // Store in localStorage
      localStorage.setItem('userData', JSON.stringify({
        userId: docRef.id,
        mobile:phone,
        userName: name
      }));

      // Redirect to menu
      router.push('/menu');
    } catch (err) {
      console.error('Error adding user:', err);
      alert('Failed to log in. Try again.');
    }
  };

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-start bg-white text-gray-800 px-4 py-6">
        <div className="w-full bg-gradient-to-b from-orange-500 to-orange-300 rounded-b-3xl pb-10 text-center">
          <h1 className="text-2xl font-bold text-white mt-6">Welcome to {restaurantName}</h1>
          <p className="text-white text-sm mt-2">To Personalise your experience,<br />Please share a few Details</p>
        </div>

        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 mt-[-3rem] z-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="e.g., Rahul"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="flex items-center space-x-2">
                <select className="px-2 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                  <option value="+91">+91</option>
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition"
            >
              Lets Dine
            </button>
          </form>
        </div>
        {/* Special Card */}
        <div className="w-full max-w-md bg-gradient-to-r from-yellow-100 to-green-100 rounded-xl p-4 mt-6 text-center">
          <div className="flex justify-center mb-2"></div>
          <h2 className="font-semibold text-lg">Chefs Special Today</h2>
          <p className="text-sm mt-1">Aromatic Hyderabadi Biryani with tender mutton and fragrant basmati rice</p>
          <div className="mt-2 flex justify-center space-x-1">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
            <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
          </div>
        </div>
        {/* Terms & Guest Link */}
        <div className="text-center text-xs text-gray-500 mt-6">
          <p>By continuing, you agree to our<br /><span className="text-blue-500 underline cursor-pointer">terms & conditions</span></p>
          <a href="#" className="text-blue-600 font-medium underline mt-2 inline-block">Continue as Guest</a>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
