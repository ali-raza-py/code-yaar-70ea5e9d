import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ForcedPasswordUpdateModal } from "./ForcedPasswordUpdateModal";

interface ForcedPasswordUpdateWrapperProps {
  children: ReactNode;
}

export function ForcedPasswordUpdateWrapper({ children }: ForcedPasswordUpdateWrapperProps) {
  const { user, passwordStrength, clearPasswordUpdateRequired } = useAuth();

  const showModal = user && passwordStrength?.needsUpdate === true;

  return (
    <>
      {children}
      {showModal && (
        <ForcedPasswordUpdateModal
          isOpen={true}
          onPasswordUpdated={clearPasswordUpdateRequired}
          userId={user.id}
        />
      )}
    </>
  );
}