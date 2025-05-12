import React from 'react';
import { motion } from 'framer-motion';
import styles from './CTA.module.css';
import { useNavigate } from 'react-router-dom';

const CTA: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className={styles.section} id="contact">
      <div className={styles.container}>
        <div className={styles.content}>
          <motion.div 
            className={styles.textContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.title}>Ready to transform your supply chain?</h2>
            <p className={styles.subtitle}>
              Join industry leaders who are leveraging AI and analytics to gain a competitive edge in their supply chain operations.
            </p>
            
            <div className={styles.ctaButtons}>
              <button className={styles.secondaryButton} onClick={() => navigate('/auth')}>Explore Now</button>
            </div>
          </motion.div>
          
          <motion.div 
            className={styles.imageContent}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className={styles.ctaImage}>
              <img src="https://images.pexels.com/photos/4481326/pexels-photo-4481326.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Supply Chain Analytics Dashboard" />
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className={styles.backgroundGradient}></div>
    </section>
  );
};

export default CTA;