import { useState } from "react";

import { CalendarDateInput } from "../CalendarDateInput/CalendarDateInput";
import type { DateRange } from "../../types/progress";

import styles from "./DateRangeForm.module.scss";

type DateRangeFormProps = {
  initialValue: DateRange | null;
  onSubmit: (dateRange: DateRange) => void;
  onReset: () => void;
};

export function DateRangeForm({
  initialValue,
  onSubmit,
  onReset,
}: DateRangeFormProps) {
  const [startDate, setStartDate] = useState(initialValue?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialValue?.endDate ?? "");
  const [resetVersion, setResetVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function validateForm(): boolean {
    setError(null);

    if (!startDate || !endDate) {
      setError("Выбери дату начала и дату конца.");

      return false;
    }

    if (endDate < startDate) {
      setError("Дата конца должна быть позже или равна дате начала.");

      return false;
    }

    return true;
  }

  function saveDateRange(): void {
    onSubmit({
      startDate,
      endDate,
    });
  }

  function handleReset(): void {
    setStartDate("");
    setEndDate("");
    setError(null);
    setResetVersion((currentVersion) => currentVersion + 1);
    onReset();
  }

  return (
    <form
      className={styles.dateForm}
      onSubmit={(event) => {
        event.preventDefault();

        const isValid = validateForm();

        if (!isValid) {
          return;
        }

        saveDateRange();
      }}
    >
      <div className={styles.formHeader}>
        <h2>Выбери период</h2>

        <p>
          Укажи дату начала и дату конца. Сегодняшний день будет считаться
          включительно.
        </p>
      </div>

      <div className={styles.formGrid}>
        <CalendarDateInput
          key={`start-date-${resetVersion}`}
          id="start-date"
          label="Дата начала"
          value={startDate}
          onChange={setStartDate}
        />

        <CalendarDateInput
          key={`end-date-${resetVersion}`}
          id="end-date"
          label="Дата конца"
          value={endDate}
          onChange={setEndDate}
        />
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <div className={styles.formActions}>
        <button className={styles.saveButton} type="submit">
          Сохранить период
        </button>

        <button
          className={styles.resetButton}
          type="button"
          onClick={handleReset}
        >
          Сбросить
        </button>
      </div>
    </form>
  );
}