import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "../types/progress";
import { calculateProgress } from "../lib/date";

/**
 * getMillisecondsUntilNextDay считает,
 * сколько миллисекунд осталось до начала следующего дня.
 */
function getMillisecondsUntilNextDay(currentDate: Date): number {
  const nextDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + 1
  );

  return nextDay.getTime() - currentDate.getTime();
}

/**
 * useProgress считает прогресс по диапазону дат.
 */
export function useProgress(dateRange: DateRange | null) {
  /**
   * now — текущий момент времени.
   *
   * При первом рендере берём текущую дату.
   */
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    /**
     * millisecondsUntilNextDay — сколько осталось до следующей полуночи.
     */
    const millisecondsUntilNextDay = getMillisecondsUntilNextDay(new Date());

    /**
     * Ставим таймер до следующего календарного дня.
     */
    const timeoutId = window.setTimeout(() => {
      setNow(new Date());
    }, millisecondsUntilNextDay);

    /**
     * Очищаем таймер, если компонент размонтируется.
     */
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [now]);

  /**
   * useMemo пересчитывает progress
   */
  const progress = useMemo(() => {
    if (!dateRange) {
      return null;
    }

    return calculateProgress(dateRange.startDate, dateRange.endDate, now);
  }, [dateRange, now]);

  return progress;
}