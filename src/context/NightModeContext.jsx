import React, { createContext, useContext, useState, useEffect } from 'react';

const NightModeContext = createContext();

export const useNightMode = () => {
  const context = useContext(NightModeContext);
  if (!context) {
    throw new Error('useNightMode must be used within NightModeProvider');
  }
  return context;
};

export const NightModeProvider = ({ children }) => {
  const [isNightMode, setIsNightMode] = useState(() => {
    // Load from localStorage or default to false
    const saved = localStorage.getItem('nightMode');
    return saved === 'true';
  });

  useEffect(() => {
    // Save to localStorage whenever it changes
    localStorage.setItem('nightMode', isNightMode);
    
    // Add/remove class from body
    if (isNightMode) {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }
  }, [isNightMode]);

  const toggleNightMode = () => {
    setIsNightMode(prev => !prev);
  };

  return (
    <NightModeContext.Provider value={{ isNightMode, toggleNightMode }}>
      {children}
    </NightModeContext.Provider>
  );
};