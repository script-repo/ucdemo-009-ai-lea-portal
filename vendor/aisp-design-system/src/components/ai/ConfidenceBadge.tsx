import type { ConfidenceLevel } from "@/tokens";

type ConfidenceBadgeProps = {
  level: ConfidenceLevel;
  score?: number;
  showScore?: boolean;
};

const LABELS: Record<ConfidenceLevel, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/**
 * Three-level confidence indicator.
 *
 * Why three levels (not a percent)? Spurious precision misleads
 * end-users. Officers should treat AI output as "trust, verify, or
 * discard" — not "73.4% true".
 *
 * If you have a raw probability you can pass `score` and set
 * `showScore` to reveal it for power users / audit views.
 */
export function ConfidenceBadge({
  level,
  score,
  showScore = false,
}: ConfidenceBadgeProps) {
  const label = LABELS[level];
  return (
    <span
      className={`confidence confidence--${level}`}
      role="status"
      aria-label={label}
      title={label}
    >
      <span className="confidence__dot" aria-hidden />
      {label}
      {showScore && typeof score === "number" && (
        <span style={{ opacity: 0.7, marginLeft: 2 }}>
          ({(score * 100).toFixed(0)}%)
        </span>
      )}
    </span>
  );
}
