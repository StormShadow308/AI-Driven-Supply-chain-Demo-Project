import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart, Zap } from 'lucide-react';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollY = window.scrollY;
      const heroImg = containerRef.current.querySelector(`.${styles.heroImageContainer}`) as HTMLElement;
      if (heroImg) {
        heroImg.style.transform = `translateY(${scrollY * 0.2}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.heroSection} id="about" ref={containerRef}>
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <motion.div 
            className={styles.badge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Zap size={14} />
            <span>AI-Powered Supply Chain Analytics</span>
          </motion.div>
          
          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transform Your Supply Chain with <span className={styles.highlight}>Intelligent</span> Insights
          </motion.h1>
          
          <motion.p 
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            ChainSight uses advanced AI algorithms to analyze your supply chain data, providing real-time insights and optimized decision recommendations.
          </motion.p>
          
          <motion.div 
            className={styles.heroCta}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button className={styles.secondaryButton} onClick={() => navigate('/auth')}>
              Login /  Signup to Explore
            </button>
          </motion.div>
          
          <motion.div 
            className={styles.statsContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className={styles.statItem}>
              <div className={styles.statValue}>94%</div>
              <div className={styles.statLabel}>Forecast Accuracy</div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>32%</div>
              <div className={styles.statLabel}>Inventory Reduction</div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>1.5x</div>
              <div className={styles.statLabel}>ROI Improvement</div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className={styles.heroImageContainer}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className={styles.floatingObject} style={{ top: '15%', left: '10%' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.floatingObject} style={{ top: '70%', right: '15%' }}>
            <BarChart size={24} />
          </div>
          <div className={styles.heroImage}>
            <img src="https://images.pexels.com/photos/7947541/pexels-photo-7947541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Supply Chain Analytics Dashboard" />
          </div>
        </motion.div>
      </div>
      
      <div className={styles.heroBackground}></div>
    </div>
  );
};

export default Hero;