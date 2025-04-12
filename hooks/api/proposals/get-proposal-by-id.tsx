import { useState, useEffect } from "react";
import { Proposal } from "@/types/proposals";
import Cookies from "js-cookie";

export const getProposalById = (id: string | null) => {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
  }, []);

  useEffect(() => {
    const fetchProposal = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const response = await fetch(`${apiUrl}/api/projects/project/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: authToken || "",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setProposal(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch proposal"
        );
        console.error("Error fetching proposal:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  return {
    proposal,
    isLoading,
    error,
  };
};
