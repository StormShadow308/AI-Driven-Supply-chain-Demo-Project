import React from 'react';
import styles from './Charts.module.css';

interface AreaChartProps {
  data: number[];
  labels: string[];
  height: number;
  color?: string;
  title?: string;
  subtitle?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  labels,
  height,
  color = '#0ea5e9',
  title,
  subtitle,
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data) > 0 ? 0 : Math.min(...data);
  const range = maxValue - minValue;
  
  // Calculate points for the SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 100;
    return `${x},${y}`;
  });
  
  // Create SVG path
  const linePath = `M${points.join(' L')}`;
  const areaPath = `${linePath} L100,100 L0,100 Z`;
  
  return (
    <div className={styles.chartContainer} style={{ height: `${height}px` }}>
      {(title || subtitle) && (
        <div className={styles.chartHeader}>
          {title && <h4 className={styles.chartTitle}>{title}</h4>}
          {subtitle && <p className={styles.chartSubtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.chartContent}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" className={styles.gridLine} />
          <line x1="0" y1="50" x2="100" y2="50" className={styles.gridLine} />
          <line x1="0" y1="75" x2="100" y2="75" className={styles.gridLine} />
          
          {/* Area fill */}
          <path
            d={areaPath}
            fill={color}
            fillOpacity="0.1"
            className={styles.areaPath}
          />
          
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2"
            className={styles.linePath}
          />
          
          {/* Data points */}
          {points.map((point, index) => {
            const [x, y] = point.split(',').map(Number);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill={color}
                className={styles.dataPoint}
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className={styles.xLabels}>
          {labels.map((label, index) => (
            <span
              key={index}
              style={{ left: `${(index / (labels.length - 1)) * 100}%` }}
              className={styles.xLabel}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreaChart;