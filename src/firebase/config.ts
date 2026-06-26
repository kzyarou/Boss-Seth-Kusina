import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCULEYBnov9y3Oj5ILojMG_BBbATWyuWVU",
  authDomain: "cookbooknibossseth.firebaseapp.com",
  projectId: "cookbooknibossseth",
  storageBucket: "cookbooknibossseth.firebasestorage.app",
  messagingSenderId: "559187129618",
  appId: "1:559187129618:web:106960e272d3c57b886fcb",
  measurementId: "G-BTTWBMCP1R"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth };
