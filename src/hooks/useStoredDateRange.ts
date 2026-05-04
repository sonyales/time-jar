import { useEffect, useState } from "react";
import type { DateRange } from "../types/progress";
import {
  clearDateRange,
  loadDateRange,
  saveDateRange,
} from "../lib/storage";

/**
 * useStoredDateRange управляет диапазоном дат.
 *
 * 1. читает даты из localStorage при первом запуске;
 * 2. хранит их в React state;
 * 3. сохраняет новые даты в localStorage;
 * 4. умеет очищать сохранённые даты.
 */
export function useStoredDateRange() {
  /**
   * dateRange — текущий диапазон дат.
   *
   * Начальное значение берём из localStorage.
   */
  const [dateRange, setDateRangeState] = useState<DateRange | null>(() => {
    return loadDateRange();
  });

  /**
   * setDateRange обновляет диапазон дат и в состоянии,
   * и в localStorage.
   */
  function setDateRange(nextDateRange: DateRange): void {
    setDateRangeState(nextDateRange);
  }

  /**
   * resetDateRange очищает диапазон дат.
   */
  function resetDateRange(): void {
    clearDateRange();
    setDateRangeState(null);
  }

  /**
   * Каждый раз, когда dateRange изменился,
   * сохраняем его в localStorage.
   */
  useEffect(() => {
    if (dateRange) {
      saveDateRange(dateRange);
    }
  }, [dateRange]);

  return {
    dateRange,
    setDateRange,
    resetDateRange,
  };
}