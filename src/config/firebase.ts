import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "***REMOVED***",
  authDomain: "studio-6659628549-fb7cd.firebaseapp.com",
  projectId: "studio-6659628549-fb7cd",
  storageBucket: "studio-6659628549-fb7cd.firebasestorage.app",
  messagingSenderId: "421879343253",
  appId: "1:421879343253:web:92483a4f2400b92b8e139c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
