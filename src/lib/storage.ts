import type { DateRange } from "../types/progress";

/**
 * Ключ, под которым хранится диапазон дат в localStorage.
 */
const STORAGE_KEY = "time-jar-date-range";

/**
 * saveDateRange сохраняет диапазон дат в localStorage.
 */
export function saveDateRange(dateRange: DateRange): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dateRange));
}

/**
 * loadDateRange читает диапазон дат из localStorage.
 *
 * Если данных нет или они сломаны, возвращаем null.
 */
export function loadDateRange(): DateRange | null {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  /**
   * Если по нашему ключу ничего нет,
   * значит пользователь ещё не сохранял даты.
   */
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as DateRange;

    /**
     * Проверяем, что в объекте действительно есть нужные поля.
     */
    if (!parsedValue.startDate || !parsedValue.endDate) {
      return null;
    }

    return parsedValue;
  } catch {
    /**
     * Если JSON.parse упал, значит данные повреждены.
     * В таком случае просто возвращаем null.
     */
    return null;
  }
}

/**
 * clearDateRange удаляет сохранённый диапазон дат.
 */
export function clearDateRange(): void {
  localStorage.removeItem(STORAGE_KEY);
}