import React from 'react';
import styled from 'styled-components';

interface ImageButtonProps {
  imageSrc: string;
  label: string;
  onClick: () => void;
}

const Button = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-size: 14px;
  color: #000;
`;

const ImageButton: React.FC<ImageButtonProps> = ({ imageSrc, label, onClick }) => {
  return (
    <Button onClick={onClick}>
      <Image src={imageSrc} alt={label} />
      <Label>{label}</Label>
    </Button>
  );
};

export default ImageButton;