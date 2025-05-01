import React, { createContext, useContext, useState, useEffect } from 'react';

const DevContext = createContext();

export const DevProvider = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(() => {
    const saved = localStorage.getItem('devMode');
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('devMode', JSON.stringify(isDevMode));
  }, [isDevMode]);

  return (
    <DevContext.Provider value={{ isDevMode, setIsDevMode }}>
      {children}
    </DevContext.Provider>
  );
};

export const useDevMode = () => {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDevMode must be used within a DevProvider');
  }
  return context;
};

export default DevContext; 