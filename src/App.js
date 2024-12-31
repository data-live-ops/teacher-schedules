import React, { useState, useEffect } from 'react';
import Calendar from './components/Calendar';
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    console.log("Logged in user:", user);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  return (
    <Router>
      <Routes>
        <Route
          path='/login'
          element={
            !isLoggedIn ? (
              <Login onLoginSuccess={handleLogin} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path='/'
          element={
            isLoggedIn ? (
              <div className="App">
                <Calendar />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;