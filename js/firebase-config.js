import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTCGGeI1HA-yfOyTI8CO10BTtbneM0oOs",
  authDomain: "zero-sus.firebaseapp.com",
  projectId: "zero-sus",
  storageBucket: "zero-sus.firebasestorage.app",
  messagingSenderId: "308451617845",
  appId: "1:308451617845:web:92b8667a9f4f57e28c957c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
