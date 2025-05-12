// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration (should be identical to the one in project/src/firebase.ts)
const firebaseConfig = {
  apiKey: "AIzaSyACHO6NtwwltlXwm7wxyJdgb-i6_COu_Mc", // MAKE SURE THIS IS YOUR ACTUAL API KEY
  authDomain: "supply-chain-fyp-demo.firebaseapp.com",
  projectId: "supply-chain-fyp-demo",
  storageBucket: "supply-chain-fyp-demo.firebasestorage.app",
  messagingSenderId: "175794742796",
  appId: "1:175794742796:web:ab66dc8eb5ad6759f77029",
  measurementId: "G-5QFE5D6YY2" // This is optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, app, googleProvider }; 