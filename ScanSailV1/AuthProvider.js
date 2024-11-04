import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native'; 

// Page to ensure that the account logged in is consistent
// across all the pages within the application

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  const logout = () => {
    if (loggedInUserId) {
      console.log("Logging out...");
      setLoggedInUserId(null); 
      Alert.alert('Logged Out', 'You have been successfully logged out.');
    } else {
      console.log("No user logged in");
      Alert.alert('No user logged in', 'No user  is currently logged in');
    }
  };

  return (
    <AuthContext.Provider value={{ loggedInUserId, setLoggedInUserId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
