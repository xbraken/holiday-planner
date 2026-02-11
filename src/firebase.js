/**
 * ============================================================
 * FIREBASE SETUP INSTRUCTIONS
 * ============================================================
 *
 * 1. Go to https://console.firebase.google.com/
 * 2. Click "Create a project" (or "Add project")
 * 3. Enter a project name (e.g., "holiday-planner")
 * 4. Disable Google Analytics if not needed, click "Create Project"
 * 5. Once created, click the Web icon (</>) to add a web app
 * 6. Register the app with a nickname (e.g., "holiday-planner-web")
 * 7. Copy the firebaseConfig object and replace the placeholder below
 *
 * ENABLE REALTIME DATABASE:
 * 8. In the Firebase console sidebar, click "Build" > "Realtime Database"
 * 9. Click "Create Database"
 * 10. Choose a location closest to your users
 * 11. Start in "Test mode" (allows read/write for 30 days)
 *     OR set these rules for open access (demo only, NOT production):
 *     {
 *       "rules": {
 *         ".read": true,
 *         ".write": true
 *       }
 *     }
 * 12. Copy the databaseURL from the Realtime Database page
 *
 * ============================================================
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
} from 'firebase/database';

// ============================================================
// REPLACE with your Firebase project config from step 7 above
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyByZBV3ktmG-Iv9UJx0z1oVSCql0yzoUxw",
  authDomain: "holiday-planner-17a18.firebaseapp.com",
  databaseURL: "https://holiday-planner-17a18-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "holiday-planner-17a18",
  storageBucket: "holiday-planner-17a18.firebasestorage.app",
  messagingSenderId: "177377096860",
  appId: "1:177377096860:web:f09ecabc771d8962fd2959",
  measurementId: "G-KW5PEX9Y1C"
};

const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app = null;
let database = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
}

export {
  database,
  isFirebaseConfigured,
  ref,
  set,
  get,
  push,
  update,
  remove,
  onValue,
  off,
  serverTimestamp,
};
