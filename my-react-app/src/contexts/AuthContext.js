// AuthContext.js
// use the user authentication status (isAuthenticated) globally across different component
// create a context and a provider component

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    'false');
    // localStorage.getItem('isAuthenticated') === 'true' // Persistence Across Sessions. Memorize authenticate even if page reload.


  // You can add more logic here for handling login, logout, etc.

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);
