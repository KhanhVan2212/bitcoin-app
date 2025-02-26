export interface CandlestickData {
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
  }
  
  export interface VolumeData {
    time: string | number;
    value: number;
    color?: string;
  }