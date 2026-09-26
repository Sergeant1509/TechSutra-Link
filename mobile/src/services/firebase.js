import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  // Paste the exact values Firebase gave you here.
  apiKey: 'AIzaSyChZdf44KDY1ioPesPrp855VswZz8JUd6w',
  authDomain: 'techsutra-link.firebaseapp.com',
  projectId: 'techsutra-link',
  storageBucket: 'techsutra-link.firebasestorage.app',
  messagingSenderId: '307314343238',
  appId: '1:307314343238:web:b77aa7ca6e25af330bf947',
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  auth = getAuth(app);
}

export { auth };

export const db = getFirestore(app);

export default app;