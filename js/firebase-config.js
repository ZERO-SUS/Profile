// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJgbFuv9yr_r7DivUU15y9uvFdvSimsnQ",
  authDomain: "zero-sus-f57c1.firebaseapp.com",
  projectId: "zero-sus-f57c1",
  storageBucket: "zero-sus-f57c1.firebasestorage.app",
  messagingSenderId: "660707509071",
  appId: "1:660707509071:web:936bda9657d1d45011bb3a",
  measurementId: "G-TNZD5YJP8H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
