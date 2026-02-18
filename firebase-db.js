/**
 * OurApp — Firebase Realtime Database Layer
 * Handles all cross-device pair-code operations.
 * Falls back to localStorage when Firebase is not configured.
 */

// ─── Initialize Firebase ─────────────────────────────────────────────────────
let _firebaseApp = null;
let _db          = null;

function initFirebase() {
  if (_db) return _db;
  if (!FIREBASE_READY) return null;
  try {
    _firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    _db = firebase.database();
    console.log('[OurApp] Firebase connected ✓');
    return _db;
  } catch (e) {
    console.warn('[OurApp] Firebase init failed, falling back to localStorage:', e.message);
    return null;
  }
}

// ─── Database API ─────────────────────────────────────────────────────────────
const DB = {

  /**
   * Register a pairing code (called by Person A on pair.html)
   * Writes to: ourapp/codes/{code} = { name, emoji, id, pairCode, createdAt }
   */
  async registerCode(code, user) {
    const db = initFirebase();
    const data = { ...user, pairCode: code, createdAt: Date.now() };

    if (db) {
      await db.ref(`ourapp/codes/${code}`).set(data);
    }
    // Always mirror to localStorage for same-browser fallback
    App.registerCode(code, user);
  },

  /**
   * Look up a pairing code (called by Person B on join.html)
   * Tries Firebase first, then localStorage.
   */
  async lookupCode(code) {
    const db = initFirebase();

    if (db) {
      try {
        const snap = await db.ref(`ourapp/codes/${code}`).get();
        if (snap.exists()) return snap.val();
      } catch (e) {
        console.warn('[OurApp] Firebase lookup failed, trying localStorage');
      }
    }
    // Fallback: localStorage
    return App.lookupCode(code);
  },

  /**
   * Person B writes their data to the code (completes the pairing)
   * Writes to: ourapp/codes/{code}/partner = { name, emoji, id, ... }
   */
  async joinCode(code, partnerData) {
    const db = initFirebase();

    if (db) {
      await db.ref(`ourapp/codes/${code}/partner`).set(partnerData);
    }

    // Mirror: update localStorage code registry for same-browser polling
    const reg = App.getCodeRegistry();
    if (reg[code]) {
      reg[code].partner = partnerData;
      App.save(App.KEYS.CODES, reg);
    }
  },

  /**
   * Listen in real-time for a partner joining (Person A on pair.html)
   * Calls callback(partnerData) when partner data appears.
   * Returns an unsubscribe function.
   */
  onPartnerJoined(code, callback) {
    const db = initFirebase();

    if (db) {
      const ref = db.ref(`ourapp/codes/${code}/partner`);
      ref.on('value', snap => {
        if (snap.exists()) callback(snap.val());
      });
      return () => ref.off('value');
    }

    // Fallback: poll localStorage every 2s
    const interval = setInterval(() => {
      const reg   = App.getCodeRegistry();
      const entry = reg[code];
      if (entry && entry.partner) {
        clearInterval(interval);
        callback(entry.partner);
      }
    }, 2000);
    return () => clearInterval(interval);
  },

  /**
   * Remove a code from the database (called on logout/pairing complete)
   */
  async removeCode(code) {
    const db = initFirebase();
    if (db) {
      await db.ref(`ourapp/codes/${code}`).remove();
    }
    App.removeCode(code);
  },

  /**
   * Check Firebase connection status
   */
  isReady() { return FIREBASE_READY; },
};
