import React, { createContext, useContext, useState } from "react";

interface HeaderRightSlotValue {
  headerRightNode: React.ReactNode | null;
  setHeaderRight: (node: React.ReactNode | null) => void;
}

const HeaderRightSlotContext = createContext<HeaderRightSlotValue>({
  headerRightNode: null,
  setHeaderRight: () => {},
});

export function HeaderRightSlotProvider({ children }: { children: React.ReactNode }) {
  const [headerRightNode, setHeaderRight] = useState<React.ReactNode | null>(null);
  return (
    <HeaderRightSlotContext.Provider value={{ headerRightNode, setHeaderRight }}>
      {children}
    </HeaderRightSlotContext.Provider>
  );
}

export function useHeaderRightSlot() {
  return useContext(HeaderRightSlotContext);
}
