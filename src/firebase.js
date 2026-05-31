import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5l5EHf_w_nJJFotGMG0rSuoLjUaKmvgg",
  authDomain: "freshcart-frontend-pttt.vercel.app",  // ← change to your Vercel URL
  projectId: "shopping-cart-app-4f1d7",
  storageBucket: "shopping-cart-app-4f1d7.firebasestorage.app",
  messagingSenderId: "136998807166",
  appId: "1:136998807166:web:dcea3e0469d0b77970da2f",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();