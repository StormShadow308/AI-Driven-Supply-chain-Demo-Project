import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './HowItWorks.module.css';

const HowItWorks: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const steps = [
    {
      number: "01",
      title: "Connect Your Data",
      description: "Easily connect to your existing systems, including ERP, CRM, and IoT devices to import and consolidate your supply chain data.",
      image: "https://images.pexels.com/photos/7654418/pexels-photo-7654418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      number: "02",
      title: "AI-Powered Analysis",
      description: "Our advanced algorithms analyze your data to identify patterns, predict future trends, and generate optimization recommendations.",
      image: "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      number: "03",
      title: "Visualize Insights",
      description: "Access intuitive dashboards that visualize complex supply chain data, making it easy to understand and act upon critical insights.",
      image: "https://images.pexels.com/photos/7621138/pexels-photo-7621138.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      number: "04",
      title: "Take Action",
      description: "Implement AI-recommended actions and monitor the impact on your KPIs in real-time to continuously improve your supply chain.",
      image: "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <section className={styles.section} ref={ref}>
      <div className={styles.container}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.sectionLabel}>How It Works</span>
          <h2 className={styles.sectionTitle}>Transform Your Supply Chain in Four Simple Steps</h2>
          <p className={styles.sectionSubtitle}>
            Our platform makes it easy to unlock the value of your supply chain data and turn insights into action.
          </p>
        </motion.div>
        
        <motion.div 
          className={styles.stepsContainer}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className={styles.step} variants={itemVariants}>
              <div className={styles.stepContent}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              <div className={styles.stepImageContainer}>
                <img 
                  src={step.image} 
                  alt={step.title} 
                  className={styles.stepImage} 
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;