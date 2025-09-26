import React from 'react';
import './ImageTextButton.css';

const Button = ({ iconSrc, text, onClick, disabled, isActive }) => {
  return (
    <button
      className="button"
      onClick={onClick}
      disabled={disabled}
    >
      <div className={`icon-container ${isActive ? 'active' : ''}`}>
        <img src={iconSrc} alt="icon" className="icon" />
      </div>
      <div className="text">{text}</div>
    </button>
  );
};

export default Button;
