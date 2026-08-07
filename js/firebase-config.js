/* =========================================================
   Firebase setup — the ONLY file you edit for backend keys.
   ---------------------------------------------------------
   1) Create a project at https://console.firebase.google.com
   2) Add a Web App (</>) and copy its firebaseConfig here.
   3) Enable Authentication → Sign-in method → Email/Password.
   4) Create ONE user (your Gmail + a password) under
      Authentication → Users → Add user. That's your login.
   5) Create a Firestore database (Build → Firestore) in
      production mode, then paste the rules from ADMIN_GUIDE.md.

   NOTE: these keys are NOT secret — Firebase web keys are meant
   to be public. Your real security is the Firestore rules
   (only a logged-in user can write) + your Auth password.
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCNUi6HCX-wL1D2Hh_jBwZ0RJJA7elpDyU",
  authDomain: "zero-sus-3dddd.firebaseapp.com",
  projectId: "zero-sus-3dddd",
  storageBucket: "zero-sus-3dddd.firebasestorage.app",
  messagingSenderId: "65403857941",
  appId: "1:65403857941:web:cf9054b63f420ba188321c",
  measurementId: "G-VW8MYGVEM3",
};

// true once you've replaced the placeholders above
export const isConfigured = !String(firebaseConfig.apiKey).startsWith("PASTE");

let auth = null, db = null;
if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}
export { auth, db };
