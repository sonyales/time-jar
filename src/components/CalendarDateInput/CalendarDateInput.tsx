import { useEffect, useMemo, useRef, useState } from "react";
import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";

import styles from "./CalendarDateInput.module.scss";

type NullableDate = Date | null;

type CalendarCell = {
  date: Date;
  currentMonth: boolean;
};

type CalendarDateInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
};

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDefaultMaxDate(): Date {
  const today = new Date();

  return new Date(today.getFullYear() + 50, 11, 31);
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseIsoDate(value: string): NullableDate {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, yearValue, monthValue, dayValue] = match;

  const year = Number(yearValue);
  const month = Number(monthValue) - 1;
  const day = Number(dayValue);

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatRuDate(date: NullableDate): string {
  if (!date) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

function parseRuDate(value: string): NullableDate {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayValue, monthValue, yearValue] = match;

  const day = Number(dayValue);
  const month = Number(monthValue) - 1;
  const year = Number(yearValue);

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function maskDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getCalendarDays(viewDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekDay = (firstDayOfMonth.getDay() + 6) % 7;

  const daysInCurrentMonth = getDaysInMonth(year, month);
  const daysInPreviousMonth = getDaysInMonth(year, month - 1);

  const cells: CalendarCell[] = [];

  for (let index = startWeekDay - 1; index >= 0; index -= 1) {
    const day = daysInPreviousMonth - index;

    cells.push({
      date: new Date(year, month - 1, day),
      currentMonth: false,
    });
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    cells.push({
      date: new Date(year, month, day),
      currentMonth: true,
    });
  }

  while (cells.length < 42) {
    const nextDay = cells.length - (startWeekDay + daysInCurrentMonth) + 1;

    cells.push({
      date: new Date(year, month + 1, nextDay),
      currentMonth: false,
    });
  }

  return cells;
}

function isSameDate(firstDate: NullableDate, secondDate: NullableDate): boolean {
  if (!firstDate || !secondDate) {
    return false;
  }

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function validateDate(date: NullableDate, minDate: Date, maxDate: Date): string {
  if (!date) {
    return "Введите корректную дату в формате дд.мм.гггг.";
  }

  const currentTime = startOfDay(date).getTime();
  const minTime = startOfDay(minDate).getTime();
  const maxTime = startOfDay(maxDate).getTime();

  if (currentTime < minTime) {
    return `Дата не может быть раньше ${formatRuDate(minDate)}.`;
  }

  if (currentTime > maxTime) {
    return `Дата не может быть позже ${formatRuDate(maxDate)}.`;
  }

  return "";
}

function isDateDisabled(date: Date, minDate: Date, maxDate: Date): boolean {
  return Boolean(validateDate(date, minDate, maxDate));
}

function classNames(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

export function CalendarDateInput({
  id,
  label,
  value,
  onChange,
  placeholder = "дд.мм.гггг",
  minDate: minDateProp,
  maxDate: maxDateProp,
}: CalendarDateInputProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const minDate = useMemo(() => {
    return startOfDay(minDateProp ?? new Date(1900, 0, 1));
  }, [minDateProp]);

  const maxDate = useMemo(() => {
    return startOfDay(maxDateProp ?? getDefaultMaxDate());
  }, [maxDateProp]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);

  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState<NullableDate>(selectedDate);
  const [focusedDay, setFocusedDay] = useState<NullableDate>(
    selectedDate ?? today
  );
  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? today);
  const [inputValue, setInputValue] = useState(() => formatRuDate(selectedDate));
  const [error, setError] = useState("");

  const years = useMemo(() => {
    const result: number[] = [];

    for (
      let year = maxDate.getFullYear();
      year >= minDate.getFullYear();
      year -= 1
    ) {
      result.push(year);
    }

    return result;
  }, [minDate, maxDate]);

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function openCalendar(): void {
    const parsedInputDate = parseRuDate(inputValue);
    const baseDate =
      parsedInputDate && !validateDate(parsedInputDate, minDate, maxDate)
        ? parsedInputDate
        : selectedDate ?? today;

    setDraftDate(baseDate);
    setFocusedDay(baseDate);
    setViewDate(baseDate);
    setIsOpen(true);
  }

  function selectDate(date: Date): void {
    const nextDate = startOfDay(date);

    if (isDateDisabled(nextDate, minDate, maxDate)) {
      return;
    }

    setDraftDate(nextDate);
    setFocusedDay(nextDate);
    setViewDate(nextDate);
    setInputValue(formatRuDate(nextDate));
    setError("");
    setIsOpen(false);

    onChange(toIsoDate(nextDate));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const maskedValue = maskDateInput(event.target.value);

    setInputValue(maskedValue);

    if (!maskedValue) {
      setDraftDate(null);
      setError("");
      onChange("");

      return;
    }

    if (maskedValue.length < 10) {
      setDraftDate(null);
      setError("");
      onChange("");

      return;
    }

    const parsedDate = parseRuDate(maskedValue);

    if (!parsedDate) {
      setDraftDate(null);
      setError("Некорректная дата.");
      onChange("");

      return;
    }

    const validationError = validateDate(parsedDate, minDate, maxDate);

    if (validationError) {
      setDraftDate(null);
      setError(validationError);
      onChange("");

      return;
    }

    setDraftDate(parsedDate);
    setFocusedDay(parsedDate);
    setViewDate(parsedDate);
    setError("");

    onChange(toIsoDate(parsedDate));
  }

  function handleInputFocus(): void {
    openCalendar();
  }

  function handleInputBlur(event: FocusEvent<HTMLInputElement>): void {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement instanceof Node &&
      wrapperRef.current?.contains(nextFocusedElement)
    ) {
      return;
    }

    if (!inputValue) {
      setError("");
      onChange("");

      return;
    }

    if (inputValue.length < 10) {
      setError("Введите дату полностью в формате дд.мм.гггг.");
      onChange("");

      return;
    }

    const parsedDate = parseRuDate(inputValue);
    const validationError = validateDate(parsedDate, minDate, maxDate);

    if (validationError) {
      setError(validationError);
      onChange("");

      return;
    }

    if (parsedDate) {
      selectDate(parsedDate);
    }
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openCalendar();
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const parsedDate = parseRuDate(inputValue);

      if (parsedDate && !validateDate(parsedDate, minDate, maxDate)) {
        selectDate(parsedDate);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  function moveFocusedDay(diff: number): void {
    const baseDate = focusedDay ?? draftDate ?? selectedDate ?? today;
    const nextDate = new Date(baseDate);

    nextDate.setDate(baseDate.getDate() + diff);

    if (nextDate < minDate) {
      setFocusedDay(minDate);
      setViewDate(minDate);

      return;
    }

    if (nextDate > maxDate) {
      setFocusedDay(maxDate);
      setViewDate(maxDate);

      return;
    }

    setFocusedDay(nextDate);
    setViewDate(nextDate);
  }

  function handleCalendarKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!isOpen) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        moveFocusedDay(-1);
        break;

      case "ArrowRight":
        event.preventDefault();
        moveFocusedDay(1);
        break;

      case "ArrowUp":
        event.preventDefault();
        moveFocusedDay(-7);
        break;

      case "ArrowDown":
        event.preventDefault();
        moveFocusedDay(7);
        break;

      case "Enter":
      case " ":
        event.preventDefault();

        if (focusedDay) {
          selectDate(focusedDay);
        }

        break;

      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        break;

      default:
        break;
    }
  }

  function handleMonthChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextMonth = Number(event.target.value);

    setViewDate((previousDate) => {
      const year = previousDate.getFullYear();
      const safeDay = Math.min(
        previousDate.getDate(),
        getDaysInMonth(year, nextMonth)
      );

      return new Date(year, nextMonth, safeDay);
    });
  }

  function handleYearChange(event: ChangeEvent<HTMLSelectElement>): void {
    const nextYear = Number(event.target.value);

    setViewDate((previousDate) => {
      const month = previousDate.getMonth();
      const safeDay = Math.min(
        previousDate.getDate(),
        getDaysInMonth(nextYear, month)
      );

      return new Date(nextYear, month, safeDay);
    });
  }

  function handleIconMouseDown(event: ReactMouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
  }

  function handleIconClick(): void {
    if (isOpen) {
      setIsOpen(false);

      return;
    }

    openCalendar();
  }

  return (
    <div className={styles.field} ref={wrapperRef}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.inputWrapper}>
        <input
          id={id}
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />

        <button
          className={styles.iconButton}
          type="button"
          aria-label={isOpen ? "Закрыть календарь" : "Открыть календарь"}
          onMouseDown={handleIconMouseDown}
          onClick={handleIconClick}
        >
          📅
        </button>
      </div>

      {error && (
        <p className={styles.error} id={`${id}-error`}>
          {error}
        </p>
      )}

      {isOpen && (
        <div
          className={styles.calendar}
          role="dialog"
          aria-label={`Календарь: ${label}`}
          tabIndex={-1}
          onKeyDown={handleCalendarKeyDown}
        >
          <div className={styles.calendarHeader}>
            <select
              className={styles.select}
              value={viewDate.getMonth()}
              onChange={handleMonthChange}
              aria-label="Месяц"
            >
              {MONTH_NAMES.map((monthName, monthIndex) => (
                <option key={monthName} value={monthIndex}>
                  {monthName}
                </option>
              ))}
            </select>

            <select
              className={styles.select}
              value={viewDate.getFullYear()}
              onChange={handleYearChange}
              aria-label="Год"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.weekDays}>
            {WEEK_DAYS.map((weekDay) => (
              <span className={styles.weekDay} key={weekDay}>
                {weekDay}
              </span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {calendarDays.map((cell) => {
              const disabled = isDateDisabled(cell.date, minDate, maxDate);
              const selected = isSameDate(cell.date, selectedDate);
              const todayDate = isSameDate(cell.date, today);

              return (
                <button
                  key={toIsoDate(cell.date)}
                  className={classNames(
                    styles.day,
                    !cell.currentMonth && styles.outsideDay,
                    selected && styles.selectedDay,
                    todayDate && styles.todayDay
                  )}
                  type="button"
                  disabled={disabled}
                  aria-selected={selected}
                  onClick={() => selectDate(cell.date)}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}