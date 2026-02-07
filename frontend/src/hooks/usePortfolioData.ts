import { useState, useEffect } from 'react';
import axios from 'axios';
import { PortfolioData, ApiResponse } from '../types/portfolio';

interface UsePortfolioDataReturn {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const usePortfolioData = (): UsePortfolioDataReturn => {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolioData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      console.log('[Portfolio API] Fetching from:', apiUrl);
      const response = await axios.get<ApiResponse>(`${apiUrl}/portfolio`);
      
      if (response.data.success) {
        setData(response.data.data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(response.data.message || 'Failed to fetch portfolio data');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Failed to fetch data: ${err.message}`);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();

    const interval = setInterval(() => {
      fetchPortfolioData();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
  };
};