import { useState } from "react";
import type { DateRange } from "../../types/progress";
import styles from "./DateRangeForm.module.scss";

type DateRangeFormProps = {
  initialValue: DateRange | null;
  onSubmit: (dateRange: DateRange) => void;
  onReset: () => void;
};

/**
 * Превращает ISO-дату из формата YYYY-MM-DD
 * в формат для пользователя: DD.MM.YYYY.
 */
function isoToDisplayDate(value: string): string {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}.${month}.${year}`;
}

/**
 * Превращает дату из формата DD.MM.YYYY
 * в формат YYYY-MM-DD.
 */
function displayDateToIso(value: string): string | null {
  const [day, month, year] = value.split(".");

  if (!day || !month || !year) {
    return null;
  }

  if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Форматирует ввод пользователя в маску DD.MM.YYYY.
 */
function formatDateInput(value: string): string {
  /**
   * Убираем всё, кроме цифр.
   */
  const digitsOnly = value.replace(/\D/g, "");

  /**
   * Ограничиваем длину: DDMMYYYY = 8 цифр.
   */
  const limitedDigits = digitsOnly.slice(0, 8);

  const day = limitedDigits.slice(0, 2);
  const month = limitedDigits.slice(2, 4);
  const year = limitedDigits.slice(4, 8);

  if (limitedDigits.length <= 2) {
    return day;
  }

  if (limitedDigits.length <= 4) {
    return `${day}.${month}`;
  }

  return `${day}.${month}.${year}`;
}

/**
 * Проверяет, что дата реально существует.
 */
function isValidDisplayDate(value: string): boolean {
  const isoDate = displayDateToIso(value);

  if (!isoDate) {
    return false;
  }

  const [year, month, day] = isoDate.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function DateRangeForm({
  initialValue,
  onSubmit,
  onReset,
}: DateRangeFormProps) {
  const [startDate, setStartDate] = useState(
    initialValue ? isoToDisplayDate(initialValue.startDate) : ""
  );

  const [endDate, setEndDate] = useState(
    initialValue ? isoToDisplayDate(initialValue.endDate) : ""
  );

  const [error, setError] = useState<string | null>(null);

  function handleReset(): void {
    setStartDate("");
    setEndDate("");
    setError(null);
    onReset();
  }

  return (
    <form
      className={styles.dateForm}
      onSubmit={(event) => {
        event.preventDefault();

        setError(null);

        if (!startDate || !endDate) {
          setError("Выбери дату начала и дату конца.");
          return;
        }

        if (!isValidDisplayDate(startDate)) {
          setError("Дата начала указана некорректно.");
          return;
        }

        if (!isValidDisplayDate(endDate)) {
          setError("Дата конца указана некорректно.");
          return;
        }

        const startDateIso = displayDateToIso(startDate);
        const endDateIso = displayDateToIso(endDate);

        if (!startDateIso || !endDateIso) {
          setError("Проверь формат дат.");
          return;
        }

        if (endDateIso < startDateIso) {
          setError("Дата конца должна быть позже или равна дате начала.");
          return;
        }

        onSubmit({
          startDate: startDateIso,
          endDate: endDateIso,
        });
      }}
    >
      <div className={styles.formHeader}>
        <h2>Выбери период ожидания</h2>
        <p>
          Укажи дату начала и дату конца. Сегодняшний день считается
          включительно.
        </p>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Дата начала</span>

          <input
            type="text"
            inputMode="numeric"
            placeholder="ДД.ММ.ГГГГ"
            value={startDate}
            onChange={(event) => {
              setStartDate(formatDateInput(event.target.value));
            }}
          />
        </label>

        <label className={styles.field}>
          <span>Дата конца</span>

          <input
            type="text"
            inputMode="numeric"
            placeholder="ДД.ММ.ГГГГ"
            value={endDate}
            onChange={(event) => {
              setEndDate(formatDateInput(event.target.value));
            }}
          />
        </label>
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <div className={styles.formActions}>
        <button className={styles.saveButton} type="submit">
          Сохранить период
        </button>

        <button className={styles.resetButton} type="button" onClick={handleReset}>
          Сбросить
        </button>
      </div>
    </form>
  );
}