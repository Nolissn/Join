import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import { getAuth, signInAnonymously }
  from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDEh0gaytbZjxxlhokOSxC1EbFf0bB3lsc",
  authDomain: "join-b3443.firebaseapp.com",
  projectId: "join-b3443",
  storageBucket: "join-b3443.firebasestorage.app",
  messagingSenderId: "709583035221",
  appId: "1:709583035221:web:e9b8661e7206ad7845eddc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

await signInAnonymously(auth);