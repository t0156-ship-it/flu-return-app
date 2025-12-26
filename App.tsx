import React, { useState, useEffect } from 'react';
import { Calendar, Info, AlertTriangle, ShieldCheck, Baby, School } from 'lucide-react';
import { StudentCategory, CalculationResult } from './types';
import { calculateReturnDate, generateTimeline, formatDateJP } from './utils/dateHelpers';
import { Timeline } from './components/Timeline';

const App: React.FC = () => {
  const [category, setCategory] = useState<StudentCategory>(StudentCategory.SCHOOL);
  const [onsetDate, setOnsetDate] = useState<string>('');
  const [feverDate, setFeverDate] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    if (onsetDate) {
      // If fever date is entered but is before onset date, it's logically weird but physically possible (wrong diagnosis initially?). 
      // For this app, let's assume valid inputs or calculate anyway.
      const res = calculateReturnDate(onsetDate, feverDate, category);
      setResult(res);
    } else {
      setResult(null);
    }
  }, [onsetDate, feverDate, category]);

  // Handle today's date for max input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen pb-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="py-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-teal-600 rounded-full shadow-lg mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
          インフルエンザ<br className="sm:hidden" />出席停止期間計算機
        </h1>
        <p className="mt-2 text-slate-600 text-sm">
          発症日と解熱日を入力するだけで、最短の登校可能日を計算します。
        </p>
      </header>

      {/* Input Section */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-5 sm:p-8 space-y-8">
          
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-500" />
              1. お子様の区分
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setCategory(StudentCategory.SCHOOL)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  category === StudentCategory.SCHOOL
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <School className={`w-8 h-8 mb-2 ${category === StudentCategory.SCHOOL ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="font-bold">小学生以上</span>
                <span className="text-[10px] mt-1 opacity-70">解熱後2日を経過</span>
                {category === StudentCategory.SCHOOL && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-teal-500 rounded-full"></div>
                )}
              </button>

              <button
                onClick={() => setCategory(StudentCategory.PRESCHOOL)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  category === StudentCategory.PRESCHOOL
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-slate-200 hover:border-slate-300 text-slate-500'
                }`}
              >
                <Baby className={`w-8 h-8 mb-2 ${category === StudentCategory.PRESCHOOL ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="font-bold">幼児（未就学児）</span>
                <span className="text-[10px] mt-1 opacity-70">解熱後3日を経過</span>
                {category === StudentCategory.PRESCHOOL && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-teal-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Onset Date */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                2. 発症日 (0日目)
              </label>
              <input
                type="date"
                max={today}
                value={onsetDate}
                onChange={(e) => setOnsetDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-lg"
              />
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                ※病院を受診した日ではなく、<strong>発熱などの症状が出始めた日</strong>を入力してください。
              </p>
            </div>

            {/* Fever Resolved Date */}
            <div className={!onsetDate ? "opacity-50 pointer-events-none" : ""}>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                3. 解熱日 (0日目)
              </label>
              <input
                type="date"
                min={onsetDate}
                value={feverDate}
                onChange={(e) => setFeverDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-lg"
              />
              <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded">
                ※薬を使わずに平熱に戻り、そのまま下がっていることを確認した日。まだの場合は空欄でOKです。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Result Section */}
      {result && onsetDate && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`rounded-2xl shadow-lg border-2 overflow-hidden ${feverDate ? 'bg-white border-emerald-500' : 'bg-amber-50 border-amber-300'}`}>
            
            <div className={`p-4 text-center text-white ${feverDate ? 'bg-emerald-500' : 'bg-amber-400'}`}>
              <h2 className="font-bold text-lg">
                {feverDate ? '最短登校可能日' : '解熱日が未定の場合の目安'}
              </h2>
            </div>

            <div className="p-6 sm:p-10 text-center">
              {!feverDate && (
                <div className="flex items-center justify-center gap-2 text-amber-700 mb-4 bg-amber-100 p-3 rounded-lg text-sm">
                  <AlertTriangle className="w-5 h-5 flex-none" />
                  <span>解熱日が入力されていません。<br className="sm:hidden"/>解熱日によって期間が延びる可能性があります。</span>
                </div>
              )}

              <p className="text-slate-500 text-sm mb-2">この日に登校再開できます</p>
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight">
                {formatDateJP(result.canReturnDate)}
              </div>
              
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                 <div className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-100">
                    発症から{result.daysFromOnset}日経過
                 </div>
                 {feverDate && (
                   <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                      解熱から{result.daysFromFever}日経過
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* Timeline Visualization */}
          <Timeline 
            days={generateTimeline(
              new Date(onsetDate), 
              feverDate ? new Date(feverDate) : null, 
              result.canReturnDate,
              category
            )} 
            category={category} 
          />
        </section>
      )}

      {/* Disclaimer */}
      <footer className="mt-12 text-slate-400 text-xs text-center pb-8">
        <div className="bg-slate-100 p-4 rounded-xl mx-auto max-w-2xl text-left">
          <p className="font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> 免責事項・注意事項
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>本アプリの計算結果は「学校保健安全法」に基づく一般的な基準です。</li>
            <li>登校再開の最終的な判断は、必ず<strong>医師、学校、またはお住まいの自治体の指示</strong>に従ってください。</li>
            <li>「発症した後5日」とは、発症した日を0日目として翌日から数えて5日目までが出席停止期間となり、6日目が登校可能日となります。</li>
            <li>入力されたデータは、お使いのブラウザ内でのみ処理され、外部サーバーへ送信・保存されることはありません。</li>
          </ul>
        </div>
      </footer>
    </div>
  );
};

export default App;