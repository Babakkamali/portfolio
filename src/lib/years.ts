export interface YearMonth {
  year: number;
  /** 1 = January */
  month: number;
}

/** Whole years between `start` and `now`, counted from the first day of the start month. */
export function yearsSince(start: YearMonth, now: Date): number {
  let years = now.getFullYear() - start.year;
  if (now.getMonth() + 1 < start.month) years -= 1;
  return Math.max(years, 0);
}
