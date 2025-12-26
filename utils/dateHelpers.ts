import { StudentCategory, CalculationResult, DayStatus } from '../types';

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDiffDays = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  // Set hours to 0 to compare dates only
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d1.getTime() - d2.getTime()) / oneDay);
};

export const formatDateJP = (date: Date): string => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${date.getMonth() + 1}月${date.getDate()}日(${days[date.getDay()]})`;
};

export const calculateReturnDate = (
  onsetDateStr: string,
  feverDateStr: string,
  category: StudentCategory
): CalculationResult | null => {
  if (!onsetDateStr) return null;

  const onsetDate = new Date(onsetDateStr);
  
  // Rule 1: Onset + 5 days (Common for all)
  const minDateFromOnset = addDays(onsetDate, 5);

  let resultDate = minDateFromOnset;
  let reason = "発症した後5日を経過";
  let feverResolvedDate: Date | null = null;

  if (feverDateStr) {
    feverResolvedDate = new Date(feverDateStr);
    
    // Safety check: Fever resolve date shouldn't be before onset (usually)
    // But logically we just calculate max.
    
    // Rule 2: Fever resolved + 2 or 3 days
    const daysAfterFever = category === StudentCategory.SCHOOL ? 2 : 3;
    const minDateFromFever = addDays(feverResolvedDate, daysAfterFever);

    if (minDateFromFever > minDateFromOnset) {
      resultDate = minDateFromFever;
      reason = category === StudentCategory.SCHOOL 
        ? "解熱した後2日を経過" 
        : "解熱した後3日を経過";
    } else {
       reason = "発症した後5日を経過";
    }
    
    // The "return date" is the day the student CAN go to school.
    // The rules say "until X days have passed". So they can return on Day X+1?
    // Japanese Law: "発症した後五日を経過し、かつ、解熱した後二日（幼児にあっては、三日）を経過するまで"
    // Meaning: Stay home UNTIL these pass. So return is the NEXT day?
    // Interpretation in schools:
    // If Onset is Day 0. Wait 5 days means Day 1,2,3,4,5 are absent. Return Day 6.
    // Let's verify standard interpretations.
    // "発症した後5日を経過" -> 5 full days passed. So Day 6 is return.
    // Logic: Onset(0) + 5 = Day 5 (last day of wait). Return = Onset + 6?
    //
    // WAIT. Most charts show:
    // Onset (0) -> Day 1 -> ... -> Day 5 (Attendance suspended). Day 6 (OK).
    // So "Onset + 5" is the last day of suspension? 
    // Usually "Wait until 5 days passed" means 5 days must complete.
    //
    // Let's use the standard "Earliest Date" calculation used by Japanese schools:
    // Min Return Date = Max(Onset + 6, FeverResolved + 3 (School) or + 4 (Infant)) ??
    //
    // Correction:
    // Standard interpretation:
    // "発症した後5日" = Day 0 (Onset), Day 1..5 (Rest). Day 6 is earliest return.
    // "解熱した後2日" = Day 0 (Resolved), Day 1..2 (Rest). Day 3 is earliest return.
    // So logic needs to add 1 day to the "Wait Period" to get "Return Date".
    
    // Let's adjust logic:
    // Required Wait Period End:
    // A: Onset + 5
    // B: Fever + 2 (School) or + 3 (Preschool)
    // Last Day of Suspension = Max(A, B)
    // Return Date = Last Day of Suspension + 1
  }

  // Recalculating based on strict interpretation:
  // "Pass 5 days" means Day 5 is the last day of waiting.
  // Return is Onset + 6.
  const lastWaitDayFromOnset = addDays(onsetDate, 5);
  let lastWaitDayTotal = lastWaitDayFromOnset;

  if (feverDateStr) {
    feverResolvedDate = new Date(feverDateStr);
    const daysWait = category === StudentCategory.SCHOOL ? 2 : 3;
    const lastWaitDayFromFever = addDays(feverResolvedDate, daysWait);
    
    if (lastWaitDayFromFever > lastWaitDayTotal) {
      lastWaitDayTotal = lastWaitDayFromFever;
    }
  }

  const returnDate = addDays(lastWaitDayTotal, 1);

  return {
    canReturnDate: returnDate,
    reason,
    daysFromOnset: getDiffDays(returnDate, onsetDate),
    daysFromFever: feverResolvedDate ? getDiffDays(returnDate, feverResolvedDate) : 0,
    isCriterionAMet: true,
    isCriterionBMet: !!feverDateStr
  };
};

export const generateTimeline = (
  onsetDate: Date,
  feverDate: Date | null,
  returnDate: Date,
  category: StudentCategory
): DayStatus[] => {
  const days: DayStatus[] = [];
  // Start from Onset date
  const startDate = new Date(onsetDate);
  // End at Return Date
  const endDate = new Date(returnDate);
  
  // Loop from start to end
  const current = new Date(startDate);
  while (current <= endDate) {
    const dayDiffOnset = getDiffDays(current, onsetDate);
    const dayDiffFever = feverDate ? getDiffDays(current, feverDate) : null;
    
    // Check Status
    // Rule: Must be > 5 days from onset AND > 2/3 days from fever
    const waitOnset = 5;
    const waitFever = category === StudentCategory.SCHOOL ? 2 : 3;
    
    const isWaitOnsetFinished = dayDiffOnset > waitOnset;
    const isWaitFeverFinished = dayDiffFever !== null ? dayDiffFever > waitFever : false;
    
    let status: 'wait' | 'ok' = 'wait';
    if (feverDate) {
        if (isWaitOnsetFinished && isWaitFeverFinished) status = 'ok';
    } else {
        // If no fever date entered yet, we show OK only based on onset, 
        // but UI will warn that fever date is needed. 
        // For visualization, we treat strictly.
        if (isWaitOnsetFinished) status = 'ok'; 
    }

    days.push({
      date: new Date(current),
      dayNumFromOnset: dayDiffOnset,
      dayNumFromFever: dayDiffFever,
      status: status,
      isOnset: dayDiffOnset === 0,
      isFeverResolved: dayDiffFever === 0,
      isReturnDate: getDiffDays(current, returnDate) === 0
    });
    
    current.setDate(current.getDate() + 1);
  }
  return days;
};