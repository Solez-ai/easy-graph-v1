import React, { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { Download, Maximize2 } from 'lucide-react';
import { ChartConfiguration } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

// Plugin to draw white (or custom) background on canvas export
const backgroundPlugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart: any, args: any, options: any) => {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    
    // Resolve background color:
    // 1. Check direct plugin options (if passed as string via chartOptions)
    // 2. Check root options (where Gemini puts it)
    // 3. Default to white
    
    let bgColor = typeof options === 'string' ? options : null;
    
    if (!bgColor && chart.config.options?.customCanvasBackgroundColor) {
        bgColor = chart.config.options.customCanvasBackgroundColor;
    }

    // Ensure we have a valid string, else white
    ctx.fillStyle = (typeof bgColor === 'string' ? bgColor : '#ffffff');
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};

interface ChartRendererProps {
  config: ChartConfiguration | null;
  isDarkMode: boolean;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ config, isDarkMode }) => {
  const chartRef = useRef<any>(null);

  // Prepare options based on whether a custom background is requested
  const chartOptions = useMemo(() => {
    if (!config) return {};

    const customBg = config.options?.customCanvasBackgroundColor;
    // Fix: Ensure customBg is a string before calling toLowerCase
    const isCustomBg = typeof customBg === 'string' && customBg.toLowerCase() !== '#ffffff' && customBg.toLowerCase() !== 'white';

    const baseOptions = {
      ...config.options,
      responsive: true,
      maintainAspectRatio: false,
    };

    // IF CUSTOM BACKGROUND (e.g. Dark Mode requested by AI):
    // We trust the AI completely for colors. We do NOT inject our defaults.
    if (isCustomBg) {
        return {
            ...baseOptions,
            plugins: {
                ...baseOptions.plugins,
                // Ensure the background plugin receives the color string as its option
                customCanvasBackgroundColor: customBg
            }
        };
    }

    // IF DEFAULT BACKGROUND (White):
    // We inject professional styling defaults (Slate text, soft grids)
    return {
      ...baseOptions,
      plugins: {
        ...baseOptions.plugins,
        // Still register the plugin so white bg is drawn on export
        customCanvasBackgroundColor: '#ffffff',
        legend: {
            ...baseOptions.plugins?.legend,
            labels: {
                color: '#334155', // Slate 700 default
                font: { family: 'Inter, system-ui, sans-serif' },
                ...baseOptions.plugins?.legend?.labels 
            }
        },
        title: {
            ...baseOptions.plugins?.title,
            color: '#0f172a', // Slate 900 default
            font: { family: 'Inter, system-ui, sans-serif', weight: 'bold' },
            ...baseOptions.plugins?.title
        }
      },
      scales: {
          ...baseOptions.scales,
          x: {
              ...baseOptions.scales?.x,
              ticks: { 
                color: '#64748b', // Slate 500
                ...baseOptions.scales?.x?.ticks 
              },
              grid: { 
                color: '#e2e8f0', // Slate 200
                ...baseOptions.scales?.x?.grid 
              }
          },
          y: {
              ...baseOptions.scales?.y,
              ticks: { 
                color: '#64748b', 
                ...baseOptions.scales?.y?.ticks 
              },
              grid: { 
                color: '#e2e8f0', 
                ...baseOptions.scales?.y?.grid 
              }
          }
      }
    };
  }, [config]);

  if (!config) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 shadow-sm">
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-dark-900 flex items-center justify-center">
          <Maximize2 className="opacity-50" />
        </div>
        <p className="text-lg font-medium">No chart generated yet</p>
        <p className="text-sm opacity-70 mt-2 text-center max-w-sm">
          Describe your data or upload a file in the chat to begin rendering visualizations.
        </p>
      </div>
    );
  }

  const downloadChart = (format: 'png' | 'jpg') => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `easygraph-export.${format}`;
      link.href = chartRef.current.toBase64Image(format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0);
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-900/50 backdrop-blur-sm rounded-t-2xl z-20 relative">
        <h2 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          Preview
        </h2>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-dark-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded-md transition-all">
              <Download size={16} />
              Export
            </button>
            {/* Dropdown menu - High Z-index to float over everything */}
            <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-dark-950 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1 transform origin-top-right">
              <button onClick={() => downloadChart('png')} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-md">PNG</button>
              <button onClick={() => downloadChart('jpg')} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-md">JPG</button>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-6 flex items-center justify-center relative bg-transparent rounded-b-2xl z-10">
        <div className="w-full h-full relative" style={{ minHeight: '300px' }}>
          <Chart
            ref={chartRef}
            type={config.type}
            data={config.data}
            plugins={[backgroundPlugin]}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartRenderer;