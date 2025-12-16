import { useState, useEffect } from 'react';
import axios from '../api/axios';

export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/dashboard');
      setData(res.data);
    } catch (error) {
      console.error("Error cargando dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return { data, loading, refresh: fetchDashboard };
}