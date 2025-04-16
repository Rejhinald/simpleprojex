import { useState } from "react";

export interface VerifyOtpData {
  otp: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const useVerifyOtp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const verifyOtp = async (verifyData: VerifyOtpData): Promise<VerifyOtpResponse> => {
    setIsLoading(true);
    setError(null);
    setData(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    try {
      const response = await fetch(`${apiUrl}/api/accounts/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyData),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'OTP verification failed');
      }
      setData(result);
      setIsLoading(false);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  return { verifyOtp, isLoading, error, data };
};
