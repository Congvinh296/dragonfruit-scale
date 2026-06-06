import AppNavigator from './navigation/AppNavigator';
import React, { useEffect } from 'react';
import { initDatabase } from './database/database';
export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);
  return <AppNavigator />;
}