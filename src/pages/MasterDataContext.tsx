import React, { createContext, useContext } from 'react';
import { useMasterData, MasterDataStore } from './masterDataStore';

const MasterDataContext = createContext<MasterDataStore | null>(null);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useMasterData();
  return (
    <MasterDataContext.Provider value={store}>
      {children}
    </MasterDataContext.Provider>
  );
};

export function useMasterDataContext(): MasterDataStore {
  const ctx = useContext(MasterDataContext);
  if (!ctx) throw new Error('useMasterDataContext must be used inside MasterDataProvider');
  return ctx;
}
