import React from 'react';
import styles from './Charts.module.css';

interface BarChartProps {
  data: number[];
  labels: string[];
  height: number;
  color?: string;
  title?: string;
  subtitle?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  labels,
  height,
  color = '#0ea5e9',
  title,
  subtitle,
}) => {
  const maxValue = Math.max(...data);
  const barWidth = 100 / data.length;
  
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
          
          {/* Bars */}
          {data.map((value, index) => {
            const barHeight = (value / maxValue) * 100;
            const xPosition = index * barWidth;
            
            return (
              <rect
                key={index}
                x={xPosition + barWidth * 0.1}
                y={100 - barHeight}
                width={barWidth * 0.8}
                height={barHeight}
                fill={color}
                opacity="0.8"
                rx="1"
                className={styles.bar}
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className={styles.xLabels}>
          {labels.map((label, index) => (
            <span
              key={index}
              style={{ 
                left: `${index * barWidth + barWidth / 2}%`,
                width: `${barWidth}%`, 
              }}
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

export default BarChart;