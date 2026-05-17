/**
 * Segmented bar spinner (iOS-style).
 *
 * 12 bars arranged radially, each fading in sequence via a shared
 * CSS keyframe with staggered delays. Inherits `currentColor` so it
 * adapts to any parent text color automatically.
 */

const BAR_COUNT = 12;

const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
  const angle = i * (360 / BAR_COUNT);
  const delay = -(BAR_COUNT - i) * (1 / BAR_COUNT);
  return { angle, delay };
});

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden
    >
      {bars.map(({ angle, delay }) => (
        <line
          key={angle}
          x1="12"
          y1="2"
          x2="12"
          y2="6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 12 12)`}
          style={{
            animation: `spinner-bar-fade 1s linear ${delay}s infinite`,
          }}
        />
      ))}
    </svg>
  );
}
