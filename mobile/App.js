import React, { useEffect, useState } from 'react';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { auth, db } from './src/services/firebase';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log('Firebase initialized successfully');
    console.log('Firebase Auth:', !!auth);
    console.log('Firebase Firestore:', !!db);

    const timer = setTimeout(() => setShowSplash(false), 2500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return <AppNavigator />;
}