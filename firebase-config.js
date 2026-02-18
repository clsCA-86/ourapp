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
const FIREBASE_CONFIG = {
  apiKey:            "PASTE_YOUR_API_KEY",
  authDomain:        "PASTE_YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "PASTE_YOUR_DATABASE_URL",   // ends with .firebaseio.com
  projectId:         "PASTE_YOUR_PROJECT_ID",
  storageBucket:     "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId:             "PASTE_YOUR_APP_ID"
};

// ─── DO NOT EDIT BELOW ───────────────────────────────────────
// Detect if config is filled in
const FIREBASE_READY = FIREBASE_CONFIG.apiKey !== "PASTE_YOUR_API_KEY";
