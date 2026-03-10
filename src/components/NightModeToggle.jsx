import React from 'react';
import { useNightMode } from '../context/NightModeContext';
import './NightModeToggle.css';

const NightModeToggle = () => {
  const { isNightMode, toggleNightMode } = useNightMode();

  return (
    <button 
      className="night-mode-toggle" 
      onClick={toggleNightMode}
      title={isNightMode ? "Switch to Light Mode" : "Switch to Night Mode"}
    >
      <div className={`toggle-track ${isNightMode ? 'active' : ''}`}>
        <div className="toggle-thumb">
          {isNightMode ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
};

export default NightModeToggle;