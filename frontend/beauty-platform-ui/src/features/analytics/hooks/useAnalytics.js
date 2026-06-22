import { useState, useEffect, useCallback } from 'react';
import { startOfMonth } from 'date-fns';
import { analyticsApi } from '../api/analytics.api';

export function useAnalytics(salonId, dateRange) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!salonId || !dateRange) return;
    setLoading(true);
    setError('');
    try {
      const response = await analyticsApi.get(salonId, dateRange.from, dateRange.to);
      setData(response.data);
    } catch {
      setError('Не вдалося завантажити статистику');
    } finally {
      setLoading(false);
    }
  }, [salonId, dateRange]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function defaultDateRange() {
  const now = new Date();
  return {
    from: startOfMonth(now).toISOString(),
    to: now.toISOString(),
  };
}
