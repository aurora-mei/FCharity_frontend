import { useMemo } from "react";

export const useCurrentUser = () => {
  const storedUser = localStorage.getItem("currentUser");

  const currentUser = useMemo(() => {
    return storedUser ? JSON.parse(storedUser) : null;
  }, [storedUser]);

  return currentUser;
};
