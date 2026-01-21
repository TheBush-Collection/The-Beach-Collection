import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export interface Rate {
  _id: string;
  id?: string;
  property: {
    _id: string;
    name: string;
    location?: string;
  };
  room: {
    _id: string;
    name: string;
    roomType: string;
    pricePerNight: number;
  };
  seasonType: 'low' | 'high' | 'peak';
  seasonName: string;
  startDate: string;
  endDate: string;
  ratePerNight: number;
  currency: string;
  minimumStay: number;
  isActive: boolean;
  notes?: string;
  mealPlan: 'room-only' | 'bed-breakfast' | 'half-board' | 'full-board' | 'all-inclusive';
  singleOccupancySupplement: number;
  childRate: number;
  childAgeLimit: number;
  extraAdultRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface RateInput {
  property: string;
  room: string;
  seasonType: 'low' | 'high' | 'peak';
  seasonName: string;
  startDate: string;
  endDate: string;
  ratePerNight: number;
  currency?: string;
  minimumStay?: number;
  isActive?: boolean;
  notes?: string;
  mealPlan?: string;
  singleOccupancySupplement?: number;
  childRate?: number;
  childAgeLimit?: number;
  extraAdultRate?: number;
}

export interface RateCalculation {
  roomId: string;
  roomName: string;
  startDate: string;
  endDate: string;
  totalNights: number;
  totalAmount: number;
  currency: string;
  breakdown: {
    rateName: string;
    seasonType: string;
    nightRate: number;
    nights: number;
    subtotal: number;
  }[];
}

interface UseRatesOptions {
  propertyId?: string;
  roomId?: string;
  seasonType?: string;
  startDate?: string;
  endDate?: string;
}

export const useRates = (options?: UseRatesOptions) => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async (opts?: UseRatesOptions) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useRates] Fetching rates...');

      const params = new URLSearchParams();
      if (opts?.propertyId) params.append('propertyId', opts.propertyId);
      if (opts?.roomId) params.append('roomId', opts.roomId);
      if (opts?.seasonType) params.append('seasonType', opts.seasonType);
      if (opts?.startDate) params.append('startDate', opts.startDate);
      if (opts?.endDate) params.append('endDate', opts.endDate);

      const response = await api.get('/rates', { params: Object.fromEntries(params) });
      console.log('[useRates] Response:', response.data);

      if (response.data.data) {
        setRates(response.data.data);
      } else {
        setRates([]);
      }
    } catch (err: unknown) {
      let message = 'Failed to fetch rates';
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || err.message;
        console.error('[useRates] Error fetching rates:', err.response?.status, err.response?.data);
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      console.error('[useRates] Error:', err);
    } finally {
      setLoading(false);
      console.log('[useRates] Loading complete');
    }
  }, []);

  useEffect(() => {
    fetchRates(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.propertyId, options?.roomId, options?.seasonType, fetchRates]);

  const createRate = async (rateData: RateInput) => {
    try {
      const response = await api.post('/rates/admin', rateData);
      if (response.data) {
        setRates(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create rate';
      throw new Error(message);
    }
  };

  const updateRate = async (id: string, rateData: Partial<RateInput>) => {
    try {
      const response = await api.put(`/rates/admin/${id}`, rateData);
      if (response.data) {
        setRates(prev => prev.map(r => r._id === id ? response.data : r));
        return response.data;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update rate';
      throw new Error(message);
    }
  };

  const deleteRate = async (id: string) => {
    try {
      await api.delete(`/rates/admin/${id}`);
      setRates(prev => prev.filter(r => r._id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete rate';
      throw new Error(message);
    }
  };

  const calculateBookingRate = async (
    roomId: string,
    startDate: string,
    endDate: string,
    adults?: number,
    children?: number
  ): Promise<RateCalculation> => {
    try {
      const response = await api.post('/rates/calculate', {
        roomId,
        startDate,
        endDate,
        adults,
        children
      });
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to calculate rate';
      throw new Error(message);
    }
  };

  const getRateForDate = async (roomId: string, date: string) => {
    try {
      const response = await api.get('/rates/for-date', {
        params: { roomId, date }
      });
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get rate for date';
      throw new Error(message);
    }
  };

  const bulkCreateRates = async (ratesData: RateInput[]) => {
    try {
      const response = await api.post('/rates/admin/bulk', { rates: ratesData });
      if (response.data.rates) {
        setRates(prev => [...prev, ...response.data.rates]);
      }
      return response.data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk create rates';
      throw new Error(message);
    }
  };

  return {
    rates,
    loading,
    error,
    fetchRates,
    createRate,
    updateRate,
    deleteRate,
    calculateBookingRate,
    getRateForDate,
    bulkCreateRates
  };
};
