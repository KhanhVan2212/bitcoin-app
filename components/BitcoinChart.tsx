import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData as LightweightCandlestickData,
  HistogramData,
} from "lightweight-charts";
import { fetchKlineData, fetchCurrentPrice } from "../utils/fetchBitcoinData";
import { CandlestickData, VolumeData } from "../types/chartData";

const timeFrames = ["1m", "5m", "30m", "1h", "4h", "1d", "1w"] as const;
type TimeFrame = (typeof timeFrames)[number];

const BitcoinChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1h");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceOneMinAgo, setPriceOneMinAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 700,
      layout: { background: { color: "#ffffff" }, textColor: "#000000" },
      grid: {
        vertLines: { color: "#e0e0e0" },
        horzLines: { color: "#e0e0e0" },
      },
      timeScale: {
        rightOffset: 10,
        barSpacing: 15,
        lockVisibleTimeRangeOnResize: true,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeriesRef.current = candlestickSeries;

    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    volumeSeriesRef.current = volumeSeries;

    let isDragging = false;
    let lastX: number | null = null;

    chartContainerRef.current.addEventListener("mousedown", (e) => {
      isDragging = true;
      lastX = e.clientX;
    });

    chartContainerRef.current.addEventListener("mousemove", (e) => {
      if (isDragging && lastX !== null) {
        const delta = (lastX - e.clientX) * 0.1;
        chart.timeScale().scrollToPosition(delta, false);
        lastX = e.clientX;
      }
    });

    chartContainerRef.current.addEventListener("mouseup", () => {
      isDragging = false;
      lastX = null;
    });

    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      chart.applyOptions({
        layout: {
          background: { color: isDark ? "#1f2937" : "#ffffff" },
          textColor: isDark ? "#ffffff" : "#000000",
        },
        grid: {
          vertLines: { color: isDark ? "#374151" : "#e0e0e0" },
          horzLines: { color: isDark ? "#374151" : "#e0e0e0" },
        },
      });
    };

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, 700);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const { candlestick, volume } = await fetchKlineData(timeFrame);
      if (candlestickSeriesRef.current && volumeSeriesRef.current) {
        candlestickSeriesRef.current.setData(
          candlestick as LightweightCandlestickData[]
        );
        volumeSeriesRef.current.setData(volume as HistogramData[]);
        chartRef.current?.timeScale().fitContent();
      }
    };
    loadData();
  }, [timeFrame]);

  const fetchPrices = async () => {
    const current = await fetchCurrentPrice();
    setCurrentPrice(current);
    const oneMinAgoData = await fetchKlineData("1m", 2);
    setPriceOneMinAgo(oneMinAgoData.candlestick[0].close);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap gap-2 mb-6">
        {timeFrames.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeFrame(tf)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFrame === tf
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Current Price
          </p>
          <p className="text-xl font-semibold">
            {currentPrice ? `$${currentPrice.toFixed(2)}` : "Loading..."}
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Price 1 Min Ago
          </p>
          <p className="text-xl font-semibold">
            {priceOneMinAgo ? `$${priceOneMinAgo.toFixed(2)}` : "Loading..."}
          </p>
        </div>
      </div>
      <button
        onClick={fetchPrices}
        className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-all mb-6"
      >
        Update Prices
      </button>
      <div
        ref={chartContainerRef}
        className="w-full h-[700px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      />
    </div>
  );
};

export default BitcoinChart;
