// src/firebase/firebase.js

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA5wjKP-ABPH0o80_XteMzLe7BqmJtZzrc",
  authDomain: "travio-fbe81.firebaseapp.com",
  projectId: "travio-fbe81",
  storageBucket: "travio-fbe81.firebasestorage.app",
  messagingSenderId: "218262285311",
  appId: "1:218262285311:web:45d6b5c06bfc59100555ca",
  measurementId: "G-S6DB7S26XW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;