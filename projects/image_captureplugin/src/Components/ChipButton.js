import React from 'react';
import './ChipButton.css';
import { Chip } from '@midasit-dev/moaui';

const ChipButton = ({ iconSrc, text, onClick, isActive, ...rest }) => {
    return (
        <div onClick={onClick} className="chip-button-container">
            <Chip isActive={isActive} {...rest}>
                <img src={iconSrc} alt="icon" className="chip-icon" />
                <span className="chip-text">{text}</span>
            </Chip>
        </div>
    );
};

export default ChipButton;
