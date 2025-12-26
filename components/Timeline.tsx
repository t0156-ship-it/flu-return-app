import React from 'react';
import { DayStatus, StudentCategory } from '../types';
import { formatDateJP } from '../utils/dateHelpers';
import { CheckCircle, AlertCircle, ThermometerSun, Thermometer } from 'lucide-react';

interface TimelineProps {
  days: DayStatus[];
  category: StudentCategory;
}

export const Timeline: React.FC<TimelineProps> = ({ days, category }) => {
  const waitFeverLimit = category === StudentCategory.SCHOOL ? 2 : 3;

  return (
    <div className="w-full mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">経過タイムライン</h3>
        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
           0日目＝発生日
        </span>
      </div>
      
      <div className="flex flex-col divide-y divide-slate-100">
        {days.map((day, idx) => {
          const isOk = day.status === 'ok';
          
          return (
            <div 
              key={day.date.toISOString()} 
              className={`flex items-center p-3 sm:px-6 transition-colors ${
                isOk ? 'bg-emerald-50/50' : 'bg-white'
              } ${day.isReturnDate ? 'bg-emerald-100 ring-2 ring-inset ring-emerald-400' : ''}`}
            >
              {/* Left: Date Info */}
              <div className="flex-none w-24 sm:w-32">
                <div className={`font-bold ${day.isReturnDate ? 'text-emerald-700 text-lg' : 'text-slate-700'}`}>
                  {formatDateJP(day.date)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {day.isReturnDate ? (
                     <span className="font-bold text-emerald-600">登校可能</span>
                  ) : (
                    <span>発症{day.dayNumFromOnset}日目</span>
                  )}
                </div>
              </div>

              {/* Middle: Visual Bar / Indicators */}
              <div className="flex-1 px-2 sm:px-4 flex flex-col gap-1">
                {/* Onset Condition */}
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 rounded-full flex-1 max-w-[120px] ${
                    day.dayNumFromOnset > 5 ? 'bg-emerald-400' : 'bg-rose-300'
                  }`}></div>
                  <span className="text-[10px] text-slate-400 min-w-[60px]">
                    {day.dayNumFromOnset > 5 ? '経過(5日超)' : `経過中(${day.dayNumFromOnset}/5)`}
                  </span>
                </div>
                
                {/* Fever Condition */}
                {day.dayNumFromFever !== null && (
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 rounded-full flex-1 max-w-[120px] ${
                      day.dayNumFromFever > waitFeverLimit ? 'bg-emerald-400' : 'bg-orange-300'
                    }`}></div>
                     <span className="text-[10px] text-slate-400 min-w-[60px]">
                        {day.dayNumFromFever > waitFeverLimit 
                          ? `経過(${waitFeverLimit}日超)` 
                          : `経過中(${day.dayNumFromFever >= 0 ? day.dayNumFromFever : '-'}/${waitFeverLimit})`
                        }
                     </span>
                  </div>
                )}
              </div>

              {/* Right: Icons/Badges */}
              <div className="flex-none w-8 flex flex-col items-center gap-1 justify-center">
                {day.isOnset && (
                  <div className="relative group">
                    <ThermometerSun className="w-6 h-6 text-rose-500" />
                    <span className="absolute right-full mr-2 top-0 bg-rose-600 text-white text-[10px] px-1 rounded whitespace-nowrap hidden group-hover:block">発症日</span>
                  </div>
                )}
                {day.isFeverResolved && (
                  <div className="relative group">
                    <Thermometer className="w-6 h-6 text-blue-500" />
                    <span className="absolute right-full mr-2 top-0 bg-blue-600 text-white text-[10px] px-1 rounded whitespace-nowrap hidden group-hover:block">解熱日</span>
                  </div>
                )}
                {day.isReturnDate && (
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                )}
                {!day.isReturnDate && !day.isOnset && !day.isFeverResolved && (
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};