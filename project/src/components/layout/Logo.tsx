import React from 'react';
import { BarChart3 } from 'lucide-react';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const logoSizeClass = size === 'small' 
    ? styles.small 
    : size === 'large' 
      ? styles.large 
      : styles.medium;

  return (
    <div className={`${styles.logo} ${logoSizeClass}`}>
      <div className={styles.logoIcon}>
        <BarChart3 />
      </div>
      <div className={styles.logoText}>
        <span className={styles.logoName}>ChainSight</span>
        {size !== 'small' && (
          <span className={styles.logoTagline}>Supply Chain Intelligence</span>
        )}
      </div>
    </div>
  );
};

export default Logo;