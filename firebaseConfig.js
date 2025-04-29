// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBU1HBUsKvkoltofKujMLwc-4FwjH89fpU",
  authDomain: "aroundu-da1d3.firebaseapp.com",
  projectId: "aroundu-da1d3",
  storageBucket: "aroundu-da1d3.firebasestorage.app",
  messagingSenderId: "329200724344",
  appId: "1:329200724344:web:c5a7415a5fc4666727c08d",
  measurementId: "G-LS912898WG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);