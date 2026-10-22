import React from 'react';
import logoUrl from '../../../assets/eSTUDY Icon_Blue & Green (1).jpg';

interface AssistantLogoProps {
  className?: string;
}

export const AssistantLogo: React.FC<AssistantLogoProps> = ({ className = '' }) => (
  <img
    src={logoUrl}
    alt="eStudy"
    className={`rounded-lg object-contain ${className}`}
  />
);
