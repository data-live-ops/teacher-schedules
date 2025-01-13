import React, { useState, useEffect } from "react";
import Calendar from './components/Calendar';
import Login from './components/Login';
import LoadingSpinner from "./components/Loading";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase-config";
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const handleLogin = (user) => {
    console.log("Logged in user:", user);
    setIsLoggedIn(true);
  }

  if (isLoading) return <LoadingSpinner />;
  return (
    <Router>
      <Routes>
        <Route path='/login' element={!isLoggedIn ? (<Login onLoginSuccess={handleLogin} />) : (<Navigate to="/" replace />)} />
        <Route path='/' element={isLoggedIn ? (
          <div className="App">
            <Calendar />
          </div>
        ) : (<Navigate to="/login" replace />)} />
      </Routes>
    </Router>
  );
};

export default App;