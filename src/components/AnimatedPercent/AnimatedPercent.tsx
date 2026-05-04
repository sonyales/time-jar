import { animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useState } from "react";

type AnimatedPercentProps = {
  /**
   * value — итоговый процент, к которому нужно плавно прийти.
   */
  value: number;
};

export function AnimatedPercent({ value }: AnimatedPercentProps) {

  const motionValue = useMotionValue(0);

  /**
   * displayValue — строка, которая показывается в интерфейсе.
   */
  const [displayValue, setDisplayValue] = useState("0.0");

  /**
   * Подписываемся на изменения motionValue.
   *
   * Каждый раз, когда Motion обновляет число,
   * оно округляется до одного знака после запятой
   * и попадает в displayValue.
   */
  useMotionValueEvent(motionValue, "change", (latestValue) => {
    setDisplayValue(latestValue.toFixed(1));
  });

  /**
   * Когда value меняется, запускается анимация
   * от текущего значения к новому.
   */
  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    
    return () => {
      controls.stop();
    };
  }, [value, motionValue]);

  return <span>{displayValue}%</span>;
}