import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDiGhgeboRZu7r0Hc3-WvmSyhZemuosG7A",
    authDomain: "teacher-schedules.firebaseapp.com",
    projectId: "teacher-schedules",
    storageBucket: "teacher-schedules.firebasestorage.app",
    messagingSenderId: "717332479723",
    appId: "1:717332479723:web:ca146fda4939c6f4c588ae",
    measurementId: "G-C47VB5HKMJ"
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();