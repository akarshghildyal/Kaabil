"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  scale: number;
  fontSize: number;
  adjustScale: (amount: number) => void;
  adjustFontSize: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(1);
  const [fontSize, setFontSize] = useState(1);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const adjustScale = (amount: number) => {
    const newScale = Math.max(0.8, Math.min(1.5, scale + amount));
    setScale(newScale);
  };

  const adjustFontSize = (amount: number) => {
    const newSize = Math.max(0.8, Math.min(1.5, fontSize + amount));
    setFontSize(newSize);
  };

  // Apply dark mode on initial load
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        scale,
        fontSize,
        adjustScale,
        adjustFontSize,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
