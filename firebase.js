import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDM_IZEYUUtzUPkKBH0GVtTUV38m_asjIc",
  authDomain: "nxtbite-444aa.firebaseapp.com",
  projectId: "nxtbite-444aa",
  storageBucket: "nxtbite-444aa.firebasestorage.app",
  messagingSenderId: "506934997110",
  appId: "1:506934997110:web:2f9c7a0ff869ca48876f57",
  measurementId: "G-W7XW20WEXG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);
// const storage = getStorage(app);

export { db };