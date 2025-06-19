import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBbVX8XT4Q2Ts1WQmlHlBC7c1do-BQV2IQ",
  authDomain: "todo-e8b75.firebaseapp.com",
  projectId: "todo-e8b75",
  storageBucket: "todo-e8b75.firebasestorage.app",
  messagingSenderId: "760489591346",
  appId: "1:760489591346:web:d03c085907e160fb82f22b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { collection, getDocs, addDoc, doc, deleteDoc, updateDoc, db, setDoc };
