"use client";

import { createContext, useContext, useState } from 'react';

const MobileComposerContext = createContext({
  isOpen: false,
  openComposer: () => {},
  closeComposer: () => {}
});

export function MobileComposerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MobileComposerContext.Provider value={{
      isOpen,
      openComposer: () => setIsOpen(true),
      closeComposer: () => setIsOpen(false)
    }}>
      {children}
    </MobileComposerContext.Provider>
  );
}

export function useMobileComposer() {
  return useContext(MobileComposerContext);
}
