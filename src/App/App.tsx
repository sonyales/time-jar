import { useRef } from "react";
import { DateRangeForm } from "../components/DateRangeForm/DateRangeForm";
import { ProgressJar } from "../components/ProgressJar/ProgressJar";
import { AnimatedPercent } from "../components/AnimatedPercent/AnimatedPercent";
import { FactCard } from "../components/FactCard/FactCard";
import { useStoredDateRange } from "../hooks/useStoredDateRange";
import { useProgress } from "../hooks/useProgress";
import { getFactForPercent } from "../lib/facts";
import type { DateRange } from "../types/progress";
import styles from "./App.module.scss";

export default function App() {
  const { dateRange, setDateRange, resetDateRange } = useStoredDateRange();

  const progress = useProgress(dateRange);

  const currentFact = progress ? getFactForPercent(progress.percent) : null;

  /**
   * progressSectionRef — ссылка на секцию с колбой.
   */
  const progressSectionRef = useRef<HTMLElement | null>(null);

  /**
   * scrollToProgress прокручивает страницу к секции прогресса.
   */
  function scrollToProgress(): void {

    if (!progressSectionRef.current) {
      return;
    }

    progressSectionRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleSaveDateRange(nextDateRange: DateRange): void {
    
    setDateRange(nextDateRange);

    requestAnimationFrame(() => {
      scrollToProgress();
    });
  }

  return (
    <main className={styles.app}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>TimeJar</p>

          <h1 className={styles.title}>Для тех, кто ждёт</h1>

          <p className={styles.heroDescription}>
            Введи дату начала и дату конца, а приложение покажет, сколько
            процентов от периода уже прошло. Сегодняшний день считается включительно.
          </p>
        </div>
      </section>

      <section className={styles.layout}>
        <DateRangeForm
          initialValue={dateRange}
          onSubmit={handleSaveDateRange}
          onReset={resetDateRange}
        />

        <section ref={progressSectionRef} className={styles.progressPanel}>
          {progress ? (
            <>
              <ProgressJar percent={progress.percent} />

              <div className={styles.progressInfo}>
                <p className={styles.progressLabel}>Пройдено</p>

                <h2 className={styles.progressPercent}>
                  <AnimatedPercent value={progress.percent} />
                </h2>

                <p className={styles.progressDays}>
                  {progress.passedDays} из {progress.totalDays} дней
                </p>

                {progress.status === "before-start" && (
                  <p className={styles.statusMessage}>Период ещё не начался.</p>
                )}

                {progress.status === "finished" && (
                  <p className={styles.statusMessage}>Период уже завершён.</p>
                )}
              </div>

              <FactCard fact={currentFact} />
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>
                Пока нет выбранного периода. Заполни форму, чтобы увидеть
                прогресс.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}