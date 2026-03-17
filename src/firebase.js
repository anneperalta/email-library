import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB1vTP77tS8zeYaSLIzKGZR6y_UXaJ4DuE",
  authDomain: "pay-email-library.firebaseapp.com",
  projectId: "pay-email-library",
  storageBucket: "pay-email-library.firebasestorage.app",
  messagingSenderId: "962375648161",
  appId: "1:962375648161:web:ab7dc2c3d09eaa5272c1e0"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
