import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBac24KoYW-enwM4mongzZzY9AFjzFbjjY",
    authDomain: "chatappai-543ab.firebaseapp.com",
    projectId: "chatappai-543ab",
    storageBucket: "chatappai-543ab.appspot.com",
    messagingSenderId: "936873543153",
    appId: "1:936873543153:web:0c82e2a80e8b5bc3c57050"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
