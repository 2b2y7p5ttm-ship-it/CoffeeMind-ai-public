interface FlavorRadarMetric {
  label: string;
  value: number;
}

interface FlavorRadarProps {
  metrics: FlavorRadarMetric[];
  size?: number;
  compact?: boolean;
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function polygonPoints(metrics: FlavorRadarMetric[], radius: number, cx: number, cy: number) {
  return metrics
    .map((metric, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / metrics.length;
      const point = polarPoint(cx, cy, radius * Math.max(0, Math.min(10, metric.value)) / 10, angle);
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

export function FlavorRadar({ metrics, size = 280, compact = false }: FlavorRadarProps) {
  const safeMetrics = metrics.length >= 3 ? metrics : [];
  if (!safeMetrics.length) return null;

  const center = size / 2;
  const labelPadding = compact ? 34 : 46;
  const radius = center - labelPadding;
  const levels = [0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[320px] overflow-visible"
        role="img"
        aria-label="Радиальный профиль вкуса"
      >
        <defs>
          <linearGradient id="flavorRadarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.44" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <filter id="flavorRadarGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {levels.map((level) => (
          <polygon
            key={level}
            points={polygonPoints(safeMetrics.map((metric) => ({ ...metric, value: 10 })), radius * level, center, center)}
            fill="none"
            stroke="var(--chart-grid)"
            strokeWidth="1"
          />
        ))}

        {safeMetrics.map((metric, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / safeMetrics.length;
          const edge = polarPoint(center, center, radius, angle);
          const label = polarPoint(center, center, radius + (compact ? 18 : 27), angle);
          const anchor = Math.abs(Math.cos(angle)) < 0.28 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';

          return (
            <g key={metric.label}>
              <line
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                stroke="var(--chart-axis)"
                strokeWidth="1"
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--chart-label)"
                fontSize={compact ? 8.5 : 10}
                fontWeight="600"
                letterSpacing="0.2"
              >
                {metric.label}
              </text>
            </g>
          );
        })}

        <polygon
          points={polygonPoints(safeMetrics, radius, center, center)}
          fill="url(#flavorRadarFill)"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinejoin="round"
          filter="url(#flavorRadarGlow)"
        />

        {safeMetrics.map((metric, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / safeMetrics.length;
          const point = polarPoint(center, center, radius * Math.max(0, Math.min(10, metric.value)) / 10, angle);
          return (
            <circle
              key={`${metric.label}-point`}
              cx={point.x}
              cy={point.y}
              r={compact ? 2.8 : 3.6}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--card))"
              strokeWidth="1.4"
            />
          );
        })}
      </svg>
    </div>
  );
}
