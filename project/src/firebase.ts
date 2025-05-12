// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added later if needed

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACHO6NtwwltlXwm7wxyJdgb-i6_COu_Mc",
  authDomain: "supply-chain-fyp-demo.firebaseapp.com",
  projectId: "supply-chain-fyp-demo",
  storageBucket: "supply-chain-fyp-demo.firebasestorage.app",
  messagingSenderId: "175794742796",
  appId: "1:175794742796:web:ab66dc8eb5ad6759f77029",
  measurementId: "G-5QFE5D6YY2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Analytics can be initialized here too if used

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, app, googleProvider }; // Export auth, app, and googleProvider 