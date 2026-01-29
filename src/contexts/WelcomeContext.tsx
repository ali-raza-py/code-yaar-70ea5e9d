import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { WelcomePopup } from "@/components/auth/WelcomePopup";
import { setWelcomeCallback, clearWelcomeCallback } from "@/contexts/AuthContext";

interface WelcomeContextType {
  showWelcome: (userName: string, isNewUser: boolean) => void;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

export function WelcomeProvider({ children }: { children: ReactNode }) {
  const [welcomeData, setWelcomeData] = useState<{
    userName: string;
    isNewUser: boolean;
  } | null>(null);

  const showWelcome = useCallback((userName: string, isNewUser: boolean) => {
    // Check if user has opted out
    const hideWelcome = localStorage.getItem("hideWelcomePopup");
    if (hideWelcome === "true") return;

    setWelcomeData({ userName, isNewUser });
  }, []);

  // Register the callback with AuthContext
  useEffect(() => {
    setWelcomeCallback(showWelcome);
    return () => {
      clearWelcomeCallback();
    };
  }, [showWelcome]);

  const handleClose = useCallback(() => {
    setWelcomeData(null);
  }, []);

  return (
    <WelcomeContext.Provider value={{ showWelcome }}>
      {children}
      {welcomeData && (
        <WelcomePopup
          userName={welcomeData.userName}
          isNewUser={welcomeData.isNewUser}
          onClose={handleClose}
        />
      )}
    </WelcomeContext.Provider>
  );
}

export function useWelcome() {
  const context = useContext(WelcomeContext);
  if (context === undefined) {
    throw new Error("useWelcome must be used within a WelcomeProvider");
  }
  return context;
}
