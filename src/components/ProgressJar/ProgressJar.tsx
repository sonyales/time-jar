import { motion } from "motion/react";
import styles from "./ProgressJar.module.scss";

type ProgressJarProps = {
  /**
   * percent — текущий процент прогресса.
   */
  percent: number;
};

/**
 * getLiquidColor возвращает цвет жидкости в зависимости от процента.
 */
function getLiquidColor(percent: number): string {
  if (percent < 25) {
    return "#38bdf8";
  }

  if (percent < 50) {
    return "#5946d4";
  }

  if (percent < 75) {
    return "#f881f6";
  }

  return "#c084fc";
}

export function ProgressJar({ percent }: ProgressJarProps) {
  const liquidTopPosition = 230 - percent * 1.8;

  const liquidColor = getLiquidColor(percent);
  
  /**
   * Верхняя поверхность жидкости.
   */
  const leftTiltPath =
    "M 47 46 C 58 46, 68 41, 79 36 C 91 31, 103 31, 115 36 C 127 41, 139 43, 151 38 C 160 34, 167 29, 173 29 V 320 H 47 Z";
  const centerWavePath =
    "M 47 34 C 58 34, 68 29, 79 31 C 91 34, 103 40, 115 41 C 127 42, 139 38, 151 34 C 160 31, 167 31, 173 31 V 320 H 47 Z";
  const rightTiltPath =
    "M 47 26 C 58 26, 68 30, 79 36 C 91 42, 103 46, 115 45 C 127 44, 139 39, 151 33 C 160 29, 167 27, 173 27 V 320 H 47 Z";

  return (
    <div className={styles.jarCard}>
      <svg className={styles.jarSvg} viewBox="0 0 220 280" role="img">
        <title>Animated progress jar</title>

        <defs>
          <clipPath id="jar-inner-clip">
            <path d="M65 35 H155 C166 35 173 44 173 56 V224 C173 248 151 260 110 260 C69 260 47 248 47 224 V56 C47 44 54 35 65 35 Z" />
          </clipPath>

          <linearGradient id="liquid-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="35%" stopColor={liquidColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={liquidColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        <path
          className={styles.jarOutline}
          d="M65 35 H155 C166 35 173 44 173 56 V224 C173 248 151 260 110 260 C69 260 47 248 47 224 V56 C47 44 54 35 65 35 Z"
        />

        <g clipPath="url(#jar-inner-clip)">
          <motion.g
            animate={{
              y: liquidTopPosition,
            }}
            transition={{
              duration: 1.4,
              ease: "easeInOut",
            }}
          >
            <motion.path
              d={centerWavePath}
              animate={{
                d: [
                  centerWavePath,
                  leftTiltPath,
                  centerWavePath,
                  rightTiltPath,
                  centerWavePath,
                ],
              }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              fill="url(#liquid-gradient)"
            />

            <motion.path
              d={rightTiltPath}
              animate={{
                d: [
                  rightTiltPath,
                  centerWavePath,
                  leftTiltPath,
                  centerWavePath,
                  rightTiltPath,
                ],
              }}
              transition={{
                duration: 7,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              fill="rgba(255, 255, 255, 0.2)"
            />
          </motion.g>

          <circle
            className={`${styles.bubble} ${styles.bubbleOne}`}
            cx="82"
            cy="220"
            r="4"
          />

          <circle
            className={`${styles.bubble} ${styles.bubbleTwo}`}
            cx="132"
            cy="210"
            r="5"
          />

          <circle
            className={`${styles.bubble} ${styles.bubbleThree}`}
            cx="110"
            cy="235"
            r="3"
          />
        </g>

        <path
          className={styles.jarHighlight}
          d="M70 58 C60 100 61 162 72 214"
        />
      </svg>
    </div>
  );
}