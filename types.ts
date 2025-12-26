export enum StudentCategory {
  SCHOOL = 'SCHOOL', // 小学生以上 (発症その後5日かつ解熱その後2日)
  PRESCHOOL = 'PRESCHOOL' // 幼児 (発症その後5日かつ解熱その後3日)
}

export interface CalculationResult {
  canReturnDate: Date;
  reason: string;
  daysFromOnset: number;
  daysFromFever: number;
  isCriterionAMet: boolean; // 発症日基準
  isCriterionBMet: boolean; // 解熱日基準
}

export interface DayStatus {
  date: Date;
  dayNumFromOnset: number;
  dayNumFromFever: number | null;
  status: 'wait' | 'ok';
  isOnset: boolean;
  isFeverResolved: boolean;
  isReturnDate: boolean;
}