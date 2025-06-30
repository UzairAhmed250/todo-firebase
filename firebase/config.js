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
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider 
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


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
const auth = getAuth(app);

export {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  db,
  setDoc,
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  query,
  where,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider 
};
