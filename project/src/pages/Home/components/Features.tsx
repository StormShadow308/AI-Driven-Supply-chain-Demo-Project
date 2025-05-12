import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Globe, 
  Network 
} from 'lucide-react';
import styles from './Features.module.css';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, delay }) => {
  return (
    <motion.div 
      className={styles.featureCard}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={styles.featureIcon}>{icon}</div>
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDescription}>{description}</p>
    </motion.div>
  );
};

const Features: React.FC = () => {
  const features = [
    {
      icon: <Network size={24} />,
      title: "Supply Chain Network Optimization",
      description: "Visualize and optimize your entire supply chain network to identify bottlenecks and improve efficiency."
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "Proactive Risk Management",
      description: "Identify potential risks before they become problems with our AI-driven risk assessment tools."
    },
    {
      icon: <Globe size={24} />,
      title: "Supplier Performance Analysis",
      description: "Track and analyze supplier performance metrics to make data-driven decisions about your supply base."
    }
  ];

  return (
    <section className={styles.featuresSection} id="features">
      <div className={styles.container}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>
            Powerful Tools for Modern Supply Chains
          </h2>
          <p className={styles.sectionSubtitle}>
            Our platform combines advanced analytics with intuitive interfaces to give you complete visibility and control over your supply chain operations.
          </p>
        </motion.div>
        
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
      
      <div className={styles.backgroundShape}></div>
    </section>
  );
};

export default Features;