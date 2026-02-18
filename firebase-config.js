/**
 * OurApp — Firebase Configuration
 * ─────────────────────────────────────────────────────────────
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Add project" → name it "ourapp" → Create
 * 3. In the left sidebar → Build → Realtime Database → Create database
 *    → Start in TEST MODE → Done
 * 4. In Project Settings (gear icon) → General → Your apps → Web (</>)
 *    → Register app → copy the firebaseConfig object below
 * ─────────────────────────────────────────────────────────────
 * PASTE YOUR CONFIG HERE ↓
 */
const firebaseConfig = {
apiKey: "AIzaSyD0VEa5FF3ascfkZV0TbwcsWkjbg3KEWfc",
authDomain: "ourapp-45560.firebaseapp.com",
databaseURL: "https://ourapp-45560-default-rtdb.firebaseio.com",
projectId: "ourapp-45560",
storageBucket: "ourapp-45560.firebasestorage.app",
messagingSenderId: "1010290192045",
appId: "1:1010290192045:web:f30a517144dcdf8daf6024"
};


// ─── DO NOT EDIT BELOW ───────────────────────────────────────
// Detect if config is filled in
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "PASTE_YOUR_API_KEY";
