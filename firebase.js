// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfNAPlQ7x6BFS2Cs5Wh3zp4Kb0JDsNwz8",
  authDomain: "inventory-tracker-6d9d7.firebaseapp.com",
  projectId: "inventory-tracker-6d9d7",
  storageBucket: "inventory-tracker-6d9d7.appspot.com",
  messagingSenderId: "840218886293",
  appId: "1:840218886293:web:179c53fb51c19ba9eadb9c",
  measurementId: "G-8VY9KCLQJ9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { firestore, storage };