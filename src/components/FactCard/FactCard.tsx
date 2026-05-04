import { motion } from "motion/react";
import type { Fact } from "../../types/progress";
import styles from "./FactCard.module.scss";

type FactCardProps = {
  /**
   * fact — факт, который нужно показать.
   * Может быть null, если подходящего факта нет.
   */
  fact: Fact | null;
};

export function FactCard({ fact }: FactCardProps) {
  /**
   * Если факта нет, показываем нейтральный текст.
   */
  if (!fact) {
    return (
      <div className={styles.factCard}>
        <p className={styles.factText}>
          Для этого процента пока не добавлен факт.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.factCard}
      key={fact.percent}
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.35,
      }}
    >
        <p className={styles.factText}>{fact.text}</p>
    </motion.div>
  );
}