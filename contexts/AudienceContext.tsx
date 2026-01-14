import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AudienceType = 'CMO' | 'VP_Marketing' | 'Brand_Director' | 'Growth_Leader';

interface AudienceContextType {
  audience: AudienceType;
  setAudience: (audience: AudienceType) => void;
}

const AudienceContext = createContext<AudienceContextType | undefined>(undefined);

export const AudienceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [audience, setAudience] = useState<AudienceType>('CMO');

  return (
    <AudienceContext.Provider value={{ audience, setAudience }}>
      {children}
    </AudienceContext.Provider>
  );
};

export const useAudience = () => {
  const context = useContext(AudienceContext);
  if (context === undefined) {
    throw new Error('useAudience must be used within an AudienceProvider');
  }
  return context;
};
