import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJVEF-6XBgUSdKx8D9O5B1kyiQ5RYwX48",
    authDomain: "surplus-to-serve.firebaseapp.com",
    projectId: "surplus-to-serve",
    storageBucket: "surplus-to-serve.firebasestorage.app",
    messagingSenderId: "469002650345",
    appId: "1:469002650345:web:d7daca20909f3baa272678",
    measurementId: "G-SKY8TYBYN2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
