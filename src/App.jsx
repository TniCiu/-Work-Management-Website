import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Board from '~/pages/Boards/_id';
import ListBoards from '~/pages/Home/ListBoards';
import Login from './components/login';
import SignUp from './components/signUp';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('ownerIds'));

  useEffect(() => {
    const checkAuthentication = () => {
      const ownerIds = localStorage.getItem('ownerIds');
      setIsAuthenticated(!!ownerIds);
    };

    checkAuthentication();
  }, []); // Chỉ chạy một lần khi component được render

  return (
    <Router>
      <Routes>
      <Route
          path="/"
          element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />}
        />
        
        <Route
        path="/signUp"
        element={<SignUp onLoginSuccess={() => setIsAuthenticated(true)} />}
      />
      
     
        <Route
          path="/boards"
          element={isAuthenticated ? <ListBoards /> : <Navigate to="/" replace />}
        />
        <Route
          path="/boards/:id"
          element={isAuthenticated ? <Board /> : <Navigate to="/" replace />}
        />
        {/* Add other routes as needed */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
 