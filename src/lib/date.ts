import type { ProgressInfo } from "../types/progress";

/**
 * Количество миллисекунд в одном дне.
 *
 * Использую это значение, чтобы переводить разницу между датами
 * из миллисекунд в дни.
 */
const MS_IN_DAY = 1000 * 60 * 60 * 24;

/**
 * parseDateInputValue превращает строку из input type="date"
 * в объект Date.
 *
 * Разбиваю дату вручную, чтобы избежать ошибки из-за 
 * интерпретации строки как UTC-даты
 */
export function parseDateInputValue(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);

  /**
   * Если пользователь передал пустую строку или неправильный формат,
   * возвращаем null.
   */
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

/**
 * toStartOfDay обнуляет часы, минуты, секунды и миллисекунды.
 *
 * Нужно, чтобы сравнивать именно календарные дни,
 * а не точное время внутри дня.
 */
export function toStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * getCalendarDayDiff считает разницу между двумя датами в днях.
 */
export function getCalendarDayDiff(from: Date, to: Date): number {
  const start = toStartOfDay(from).getTime();
  const end = toStartOfDay(to).getTime();

  return Math.floor((end - start) / MS_IN_DAY);
}

/**
 * clamp ограничивает число в заданном диапазоне.
 * 
 * Помогает исключить отрицательный процент и другие ошибки.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * calculateProgress — главная функция расчёта прогресса.
 *
 * Примечание: сегодняшняя дата считается включительно.
 */
export function calculateProgress(
  startDateValue: string,
  endDateValue: string,
  currentDate: Date = new Date()
): ProgressInfo {
  /**
   * Превращаем строки из input type="date" в Date.
   */
  const startDate = parseDateInputValue(startDateValue);
  const endDate = parseDateInputValue(endDateValue);

  /**
   * Если одну из дат не удалось распарсить,
   * считаем диапазон невалидным.
   */
  if (!startDate || !endDate) {
    return {
      totalDays: 0,
      passedDays: 0,
      percent: 0,
      status: "invalid",
    };
  }

  /**
   * Приводим даты к началу дня, чтобы избежать багов по часам.
   */
  const start = toStartOfDay(startDate);
  const end = toStartOfDay(endDate);
  const today = toStartOfDay(currentDate);

  /**
   * Если дата конца раньше даты начала,
   * это неправильный диапазон.
   */
  if (end < start) {
    return {
      totalDays: 0,
      passedDays: 0,
      percent: 0,
      status: "invalid",
    };
  }

  /**
   * Общее количество дней считаем включительно.
   *
   * Например:
   * 1 мая — 1 мая = 1 день
   * Поэтому к разнице добавляем +1.
   */
  const totalDays = getCalendarDayDiff(start, end) + 1;

  /**
   * Если сегодня раньше даты начала,
   * значит период ещё не начался.
   */
  if (today < start) {
    return {
      totalDays,
      passedDays: 0,
      percent: 0,
      status: "before-start",
    };
  }

  /**
   * Если сегодня позже даты конца,
   * значит период уже завершён.
   */
  if (today > end) {
    return {
      totalDays,
      passedDays: totalDays,
      percent: 100,
      status: "finished",
    };
  }

  /**
   * Количество прошедших дней тоже считаем включительно.
   * добавляем +1.
   */
  const passedDays = getCalendarDayDiff(start, today) + 1;

  /**
   * Считаем процент.
   */
  const rawPercent = (passedDays / totalDays) * 100;

  /**
   * Ограничиваем процент от 0 до 100
   */
  const percent = clamp(rawPercent, 0, 100);

  return {
    totalDays,
    passedDays,
    percent,
    status: "in-progress",
  };
}