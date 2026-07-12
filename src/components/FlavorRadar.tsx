import { motion, useReducedMotion } from 'framer-motion';

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
  const reduceMotion = useReducedMotion();
  if (!safeMetrics.length) return null;

  const center = size / 2;
  const labelPadding = compact ? 34 : 46;
  const radius = center - labelPadding;
  const levels = [0.25, 0.5, 0.75, 1];
  const fullPoints = polygonPoints(safeMetrics, radius, center, center);
  const collapsedPoints = safeMetrics.map(() => `${center},${center}`).join(' ');

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

        {levels.map((level, index) => (
          <motion.polygon
            key={level}
            points={polygonPoints(safeMetrics.map((metric) => ({ ...metric, value: 10 })), radius * level, center, center)}
            fill="none"
            stroke="var(--chart-grid)"
            strokeWidth="1"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.82, transformOrigin: 'center' }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.42 }}
          />
        ))}

        {safeMetrics.map((metric, index) => {
          const angle = -Math.PI / 2 + (Math.PI * 2 * index) / safeMetrics.length;
          const edge = polarPoint(center, center, radius, angle);
          const label = polarPoint(center, center, radius + (compact ? 18 : 27), angle);
          const anchor = Math.abs(Math.cos(angle)) < 0.28 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';

          return (
            <g key={metric.label}>
              <line x1={center} y1={center} x2={edge.x} y2={edge.y} stroke="var(--chart-axis)" strokeWidth="1" />
              <motion.text
                x={label.x}
                y={label.y}
                textAnchor={anchor}
                dominantBaseline="middle"
                fill="var(--chart-label)"
                fontSize={compact ? 8.5 : 10}
                fontWeight="600"
                letterSpacing="0.2"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + index * 0.05 }}
              >
                {metric.label}
              </motion.text>
            </g>
          );
        })}

        <motion.polygon
          initial={reduceMotion ? false : { points: collapsedPoints, opacity: 0 }}
          animate={{ points: fullPoints, opacity: 1 }}
          transition={{ duration: 0.85, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
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
            <motion.circle
              key={`${metric.label}-point`}
              cx={point.x}
              cy={point.y}
              r={compact ? 2.8 : 3.6}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--card))"
              strokeWidth="1.4"
              initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.62 + index * 0.06, type: 'spring', stiffness: 420, damping: 24 }}
            />
          );
        })}
      </svg>
    </div>
  );
}
