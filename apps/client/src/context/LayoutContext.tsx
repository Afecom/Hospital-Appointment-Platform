import { useContext, createContext, useState, ReactNode } from "react";

interface LayoutContextType {
  expanded: boolean;
  setExpanded: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpand] = useState(false);
  const setExpanded = () => setExpand((prev) => !prev);
  return (
    <LayoutContext.Provider value={{ expanded, setExpanded }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("useLayout must be used within layoutProvider");
  return context;
};
