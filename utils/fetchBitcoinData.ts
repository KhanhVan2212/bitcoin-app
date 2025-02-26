import axios from 'axios';
import { CandlestickData, VolumeData } from '@/types/chartData';
const BASE_URL = 'https://api.binance.com/api/v3';

export const fetchKlineData = async (
  interval: string,
  limit: number = 500
): Promise<{ candlestick: CandlestickData[]; volume: VolumeData[] }> => {
  const response = await axios.get(`${BASE_URL}/klines`, {
    params: {
      symbol: 'BTCUSDT',
      interval,
      limit,
    },
  });

  const data = response.data;
  const candlestick: CandlestickData[] = [];
  const volume: VolumeData[] = [];

  data.forEach((item: any[]) => {
    const [time, open, high, low, close, vol] = item;
    candlestick.push({
      time: time / 1000, 
      open: parseFloat(open),
      high: parseFloat(high),
      low: parseFloat(low),
      close: parseFloat(close),
    });
    volume.push({
      time: time / 1000,
      value: parseFloat(vol),
      color: parseFloat(close) >= parseFloat(open) ? '#26a69a' : '#ef5350', 
    });
  });

  return { candlestick, volume };
};

export const fetchCurrentPrice = async (): Promise<number> => {
  const response = await axios.get(`${BASE_URL}/ticker/price`, {
    params: { symbol: 'BTCUSDT' },
  });
  return parseFloat(response.data.price);
};