"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: {
    email: string;
    username: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextType["user"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthToken = () => {
      const cookies = document.cookie.split(";");
      const token = cookies
        .find((cookie) => cookie.trim().startsWith("auth-token="))
        ?.split("=")[1];

      if (token) {
        setAuthToken(token);
      }
    };

    checkAuthToken();

    const interval = setInterval(checkAuthToken, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!authToken) return;

      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const response = await fetch(`${apiUrl}/api/accounts/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch user data");
        }

        const userData = await response.json();
        setUser({
          email: userData.email,
          username: userData.username,
        });
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setUser(null);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authToken]);

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
