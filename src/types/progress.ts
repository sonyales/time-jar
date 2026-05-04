/**
 * DateRange - это диапазон дат, который вводит пользователь.
 *
 * Даты хранятся как строки в формате YYYY-MM-DD,
 * в формате, который возвращает input type="date".
 */
export type DateRange = {
  startDate: string;
  endDate: string;
};

/**
 * ProgressStatus описывает состояние прогресса.
 *
 * before-start - период ещё не начался.
 * in-progress - период идёт сейчас.
 * finished - период уже закончился.
 * invalid - диапазон дат некорректный.
 */
export type ProgressStatus =
  | "before-start"
  | "in-progress"
  | "finished"
  | "invalid";

/**
 * ProgressInfo - результат расчёта прогресса.
 *
 * totalDays - общее количество дней в периоде.
 * passedDays - сколько дней уже прошло, включая сегодняшний день.
 * percent - процент прохождения периода.
 * status - состояние периода.
 */
export type ProgressInfo = {
  totalDays: number;
  passedDays: number;
  percent: number;
  status: ProgressStatus;
};

/**
 * Fact - факт, который будет связан с определённым процентом.
 */
export type Fact = {
  percent: number;
  text: string;
  source?: string;
};