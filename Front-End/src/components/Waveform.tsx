type WaveformProps = {
  bars?: number;
  live?: boolean;
  className?: string;
  heights?: number[];
};

/**
 * CareerCoach's signature motif — a row of waveform bars.
 * Used as section dividers, a "recording" indicator, and progress markers.
 * Pass `live` to animate (respects prefers-reduced-motion).
 */
export default function Waveform({
  bars = 24,
  live = false,
  className = "",
  heights,
}: WaveformProps): JSX.Element {
  const values =
    heights ??
    Array.from({ length: bars }, (_, i) => {
      // deterministic pseudo-random heights so the pattern feels organic, not random-per-render
      const seed = Math.sin(i * 12.9898) * 43758.5453;
      const frac = seed - Math.floor(seed);
      return 0.25 + frac * 0.75;
    });

  return (
    <div
      className={`mm-waveform ${live ? "mm-waveform-live" : ""} ${className}`}
      aria-hidden="true"
    >
      {values.map((h, i) => (
        <span
          key={i}
          className="mm-waveform-bar"
          style={{
            height: `${Math.max(h * 100, 15)}%`,
            animationDelay: live ? `${(i % 8) * 80}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}