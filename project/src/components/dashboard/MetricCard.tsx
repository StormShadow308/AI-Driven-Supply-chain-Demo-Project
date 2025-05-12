import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend = 'neutral',
  icon = <TrendingUp size={18} />,
  subtitle,
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return styles.positive;
    if (trend === 'down') return styles.negative;
    return styles.neutral;
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight size={14} />;
    if (trend === 'down') return <ArrowDownRight size={14} />;
    return null;
  };

  return (
    <Card className={styles.metricCard}>
      <div className={styles.metricHeader}>
        <div className={styles.metricTitle}>{title}</div>
        <div className={styles.metricIcon}>{icon}</div>
      </div>
      
      <div className={styles.metricValue}>{value}</div>
      
      {(change !== undefined || subtitle) && (
        <div className={styles.metricFooter}>
          {change !== undefined && (
            <div className={`${styles.metricChange} ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
          {subtitle && <div className={styles.metricSubtitle}>{subtitle}</div>}
        </div>
      )}
    </Card>
  );
};

export default MetricCard;