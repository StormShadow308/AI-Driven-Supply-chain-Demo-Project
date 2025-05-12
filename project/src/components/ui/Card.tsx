import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
  isLoading?: boolean;
  fullHeight?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  className,
  footer,
  isLoading = false,
  fullHeight = false,
}) => {
  return (
    <div className={`${styles.card} ${fullHeight ? styles.fullHeight : ''} ${className || ''}`}>
      {(title || subtitle || icon) && (
        <div className={styles.cardHeader}>
          {icon && <div className={styles.cardIcon}>{icon}</div>}
          <div className={styles.cardTitles}>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>
        </div>
      )}
      
      <div className={styles.cardContent}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading data...</p>
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </div>
  );
};

export default Card;