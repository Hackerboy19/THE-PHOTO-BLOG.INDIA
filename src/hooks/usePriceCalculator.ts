import { useState, useEffect, useMemo } from 'react';

export interface PricingSettings {
  basePrices: Record<string, number>;
  scaleMultipliers: Record<string, number>;
  timelineMultipliers: Record<string, number>;
}

const DEFAULT_EXCHANGE_RATE = 83.5;
const RATE_CACHE_KEY = 'thephotoblog_usd_inr_rate_cached';
const RATE_CACHE_TIME_KEY = 'thephotoblog_usd_inr_rate_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours caching

/**
 * Fetch live USD to INR exchange rate with caching and graceful fallbacks
 */
export async function fetchUSDToINRRate(): Promise<number> {
  try {
    // Check local cache first
    const cachedRate = localStorage.getItem(RATE_CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(RATE_CACHE_TIME_KEY);
    
    if (cachedRate && cachedTimestamp) {
      const parsedTime = parseInt(cachedTimestamp, 10);
      if (Date.now() - parsedTime < CACHE_DURATION_MS) {
        const rate = parseFloat(cachedRate);
        if (rate > 50 && rate < 120) {
          return rate;
        }
      }
    }

    // Attempt to hit external open exchange rate api
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (response.ok) {
      const data = await response.json();
      const liveRate = data?.rates?.INR;
      if (liveRate && liveRate > 50 && liveRate < 120) {
        localStorage.setItem(RATE_CACHE_KEY, liveRate.toString());
        localStorage.setItem(RATE_CACHE_TIME_KEY, Date.now().toString());
        return liveRate;
      }
    }
  } catch (error) {
    console.warn('Unable to retrieve daily exchange rate. Utilizing baseline fallback:', error);
  }
  return DEFAULT_EXCHANGE_RATE;
}

/**
 * Debounce utility hook
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Dedicated Custom Hook for Campaign Pricing Engine
 */
export function usePriceCalculator(
  config: PricingSettings | null,
  selectedServices: string[],
  scale: string,
  timeline: string,
  debounceMs: number = 300,
  currency: 'INR' | 'USD' = 'INR'
) {
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);

  // Load exchange rate on mount
  useEffect(() => {
    let active = true;
    fetchUSDToINRRate().then((rate) => {
      if (active) {
        setExchangeRate(rate);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Debounced configurations
  const debouncedServices = useDebouncedValue(selectedServices, debounceMs);
  const debouncedScale = useDebouncedValue(scale, debounceMs);
  const debouncedTimeline = useDebouncedValue(timeline, debounceMs);

  // Computations
  const results = useMemo(() => {
    if (!config) {
      return {
        baseUSD: 0,
        totalUSD: 0,
        minINR: 0,
        maxINR: 0,
        minUSD: 0,
        maxUSD: 0,
        minINRFormatted: '₹0',
        maxINRFormatted: '₹0',
        minUSDFormatted: '$0',
        maxUSDFormatted: '$0',
        rangeText: '₹0',
        exchangeRate,
      };
    }

    let baseUSD = 0;
    debouncedServices.forEach((serviceId) => {
      baseUSD += config.basePrices[serviceId] || 0;
    });

    const scaleMult = config.scaleMultipliers[debouncedScale] ?? 1.0;
    const timelineMult = config.timelineMultipliers[debouncedTimeline] ?? 1.0;

    const totalUSD = baseUSD * scaleMult * timelineMult;
    
    // Core calculation range: standard budget (min) and upper contingency tier (max)
    const minUSD = totalUSD;
    const maxUSD = totalUSD * 1.3;

    const minINR = Math.round(totalUSD * exchangeRate);
    const maxINR = Math.round(totalUSD * 1.3 * exchangeRate);

    const minINRFormatted = `₹${minINR.toLocaleString('en-IN')}`;
    const maxINRFormatted = `₹${maxINR.toLocaleString('en-IN')}`;
    const minUSDFormatted = `$${Math.round(minUSD).toLocaleString('en-US')}`;
    const maxUSDFormatted = `$${Math.round(maxUSD).toLocaleString('en-US')}`;

    const isINR = currency === 'INR';
    const rangeText = isINR
      ? `${minINRFormatted} - ${maxINRFormatted}`
      : `${minUSDFormatted} - ${maxUSDFormatted}`;

    return {
      baseUSD,
      totalUSD,
      minINR,
      maxINR,
      minUSD,
      maxUSD,
      minINRFormatted,
      maxINRFormatted,
      minUSDFormatted,
      maxUSDFormatted,
      rangeText,
      exchangeRate,
    };
  }, [config, debouncedServices, debouncedScale, debouncedTimeline, exchangeRate, currency]);

  return results;
}
