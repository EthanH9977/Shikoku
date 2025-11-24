import React, { useEffect, useState, useRef } from 'react';
import { CloudSun, RefreshCw, Settings, Cloud, HardDrive } from 'lucide-react';
import { fetchWeatherForLocation, WeatherResult } from '../services/geminiService';

interface HeroProps {
  dayStr: string;
  region: string;
  dateStr: string;
  onExport: () => void;
  onImport: (file: File) => void;
  onOpenDrive: () => void;
  isOfflineMode: boolean;
}

const Hero: React.FC<HeroProps> = ({ dayStr, region, dateStr, onExport, onImport, onOpenDrive, isOfflineMode }) => {
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getWeather = async () => {
    setLoading(true);
    const data = await fetchWeatherForLocation(region, dateStr);
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    getWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, dateStr]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImport(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowSettings(false);
  };

  // Parse region to remove english part for cleaner look
  const jpRegion = region.split(' ')[0];
  const enRegion = region.split(' ').slice(1).join(' ');

  return (
    <div className="relative bg-shikoku-indigo text-shikoku-paper pt-5 pb-3 px-5 overflow-visible transition-all duration-500 rounded-b-[1.25rem] shadow-lg shadow-indigo-900/20 z-20">
      
      {/* Decorative Traditional Patterns */}
      <div className="absolute inset-0 overflow-hidden rounded-b-[1.25rem] pointer-events-none">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3"></div>
      </div>
      
      {/* Main Content Area: Compact Row */}
      <div className="flex items-end justify-between relative z-10">
        
        {/* Left: Location & Date */}
        <div className="pb-1">
            <div className="flex items-baseline gap-2 mb-0.5 opacity-80">
                <span className="text-[10px] font-medium tracking-widest bg-white/10 px-1.5 py-0.5 rounded text-indigo-100">{dayStr}</span>
                <span className="text-[10px] text-indigo-200">{dateStr}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white leading-none">
              {jpRegion}
            </h1>
            {enRegion && (
              <p className="text-indigo-200 text-[10px] tracking-wider uppercase opacity-60 mt-0.5 font-medium">
                {enRegion}
              </p>
            )}
        </div>

        {/* Right: Weather Cluster */}
        <div className="flex items-center gap-2">
          
          {/* Vertical Badge (Left of Weather) */}
          {weather && !loading && (
            <div className={`flex flex-col items-center justify-center py-1 px-0.5 rounded border leading-none ${
              weather.source === 'forecast' 
                ? 'bg-green-500/10 border-green-400/30 text-green-100' 
                : 'bg-amber-500/10 border-amber-400/30 text-amber-100'
            }`}>
              <span className="text-[9px] font-medium writing-vertical-rl tracking-widest opacity-80">
                {weather.source === 'forecast' ? '預報' : '歷史'}
              </span>
            </div>
          )}

          {/* Weather Icon & Temp */}
          <div className="flex flex-col items-center bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm min-w-[56px]">
            {loading ? (
               <RefreshCw className="animate-spin text-indigo-200 my-1" size={16} />
            ) : (
              <>
                <CloudSun className="text-shikoku-red mb-0.5" size={20} />
                <span className="text-sm font-bold text-white leading-none">{weather?.temperature || "--"}</span>
                <span className="text-[8px] text-indigo-200 mt-0.5 scale-90">{weather?.condition || "未知"}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Advice + Status + Settings */}
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between relative z-20">
        
        {/* Advice Text */}
        <div className="flex items-start gap-1.5 opacity-80 max-w-[65%]">
            {weather?.advice && !loading ? (
                <>
                    <span className="font-bold text-shikoku-gold text-[10px] shrink-0 mt-0.5">Tips</span>
                    <span className="text-[10px] text-indigo-100 leading-tight line-clamp-1">{weather.advice}</span>
                </>
            ) : (
                 <span className="text-[10px] text-indigo-300">載入天氣資訊中...</span>
            )}
        </div>

        <div className="flex items-center gap-3">
             {/* Connection Status Indicator */}
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                isOfflineMode 
                ? 'bg-orange-500/20 text-orange-200 border-orange-500/30' 
                : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
            }`}>
                {isOfflineMode ? <HardDrive size={10} /> : <Cloud size={10} />}
                <span>{isOfflineMode ? 'Local' : 'Cloud'}</span>
            </div>

            {/* Settings Button */}
            <div className="relative">
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-indigo-200/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Settings size={14} />
                </button>
                
                {/* Menu - Opens Upwards */}
                {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-shikoku-paper text-shikoku-ink rounded-lg shadow-xl border border-stone-100 p-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1 z-50">
                        <button 
                            onClick={() => { setShowSettings(false); onOpenDrive(); }}
                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-100 rounded-md w-full text-left text-shikoku-indigo font-bold"
                        >
                            <Cloud size={14} />
                            <span>設定與同步</span>
                        </button>
                        <hr className="border-stone-200 my-1" />
                        <button 
                            onClick={onExport}
                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-100 rounded-md w-full text-left font-medium"
                        >
                            <span>匯出行程 (JSON)</span>
                        </button>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-100 rounded-md w-full text-left font-medium"
                        >
                            <span>讀取行程 (JSON)</span>
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {showSettings && (
          <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)}></div>
      )}
    </div>
  );
};

export default Hero;