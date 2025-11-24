
import React, { useRef, useEffect } from 'react';
import { DayItinerary } from '../types';
import { Menu } from 'lucide-react';

interface BottomNavProps {
  days: DayItinerary[];
  currentDayId: number;
  onSelectDay: (dayId: number) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ days, currentDayId, onSelectDay }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll to active item
    if (scrollRef.current) {
      const activeElement = scrollRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentDayId]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-md z-40">
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-200/80 p-1.5">
        <div 
            ref={scrollRef}
            className="flex overflow-x-auto no-scrollbar gap-1.5 snap-x items-center"
        >
            {/* Settings Button (Inserted before Day 1) */}
            <button
                data-active={currentDayId === 0}
                onClick={() => onSelectDay(0)}
                className={`
                    flex-shrink-0 snap-center rounded-lg px-3 py-1.5 flex flex-col items-center justify-center min-w-[48px] h-[52px] transition-all duration-300 relative overflow-hidden
                    ${currentDayId === 0
                    ? 'bg-stone-800 text-white shadow-sm' 
                    : 'bg-transparent text-stone-400 hover:bg-stone-50'}
                `}
            >
                <Menu size={20} className="mb-0.5" />
                <span className="text-[9px] font-bold">設定</span>
                
                {currentDayId === 0 && (
                    <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-50"></div>
                )}
            </button>

            {/* Separator */}
            <div className="w-[1px] h-8 bg-stone-100 mx-0.5 shrink-0"></div>

            {/* Day Buttons */}
            {days.map((day) => {
            const isActive = day.dayId === currentDayId;
            return (
                <button
                key={day.dayId}
                data-active={isActive}
                onClick={() => onSelectDay(day.dayId)}
                className={`
                    flex-shrink-0 snap-center rounded-lg px-2.5 py-1.5 flex flex-col items-center justify-center min-w-[48px] h-[52px] transition-all duration-300 relative overflow-hidden
                    ${isActive 
                    ? 'bg-shikoku-indigo text-white shadow-sm' 
                    : 'bg-transparent text-stone-400 hover:bg-stone-50'}
                `}
                >
                <span className="text-[8px] font-sans font-bold uppercase tracking-wider opacity-60 mb-0.5">Day</span>
                <span className={`text-lg leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {day.dayId}
                </span>
                
                {/* Active Indicator Dot */}
                {isActive && (
                    <div className="absolute top-1 right-1 w-1 h-1 bg-shikoku-red rounded-full shadow-sm"></div>
                )}
                </button>
            );
            })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
