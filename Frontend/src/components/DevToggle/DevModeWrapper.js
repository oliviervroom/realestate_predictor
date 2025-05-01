import React from 'react';
import { useDevMode } from './DevContext';

const DevModeWrapper = ({ children }) => {
  const { isDevMode } = useDevMode();

  if (!isDevMode) {
    return null;
  }

  return children;
};

export default DevModeWrapper; 