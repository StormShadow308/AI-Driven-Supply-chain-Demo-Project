import React from 'react';
import { motion } from 'framer-motion';
import styles from './Testimonials.module.css';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  delay: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ 
  quote, author, role, company, delay 
}) => {
  return (
    <motion.div 
      className={styles.testimonial}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={styles.quoteIcon}>
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.76 0C5.81333 0 0 5.81333 0 12.76V32H19.2427V12.76H6.38C6.38 9.25333 9.25333 6.38 12.76 6.38V0ZM32.5173 0C25.5707 0 19.7573 5.81333 19.7573 12.76V32H39V12.76H26.1373C26.1373 9.25333 29.0107 6.38 32.5173 6.38V0Z" fill="currentColor"/>
        </svg>
      </div>
      <p className={styles.quote}>{quote}</p>
      <div className={styles.authorInfo}>
        <div className={styles.authorName}>{author}</div>
        <div className={styles.authorRole}>{role}, {company}</div>
      </div>
    </motion.div>
  );
};

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote: "ChainSight's AI forecasting has transformed our inventory management. We've reduced stockouts by 78% while simultaneously decreasing our overall inventory by 32%.",
      author: "Sarah Johnson",
      role: "VP of Supply Chain",
      company: "Global Electronics Inc."
    },
    {
      quote: "The network visualization tools have helped us identify bottlenecks we didn't even know existed. Our throughput is up 24% since implementation.",
      author: "Michael Chen",
      role: "Director of Operations",
      company: "Meridian Manufacturing"
    },
    {
      quote: "We avoided a major disruption thanks to ChainSight's risk assessment tools. The platform alerted us to potential issues with a key supplier three weeks before they became critical.",
      author: "James Peterson",
      role: "Chief Supply Chain Officer",
      company: "NorthStar Consumer Goods"
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>Trusted by Industry Leaders</h2>
          <p className={styles.sectionSubtitle}>
            See how leading companies are transforming their supply chains with our platform.
          </p>
        </motion.div>
        
        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <Testimonial 
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        <div className={styles.logosContainer}>
          <motion.div 
            className={styles.logosRow}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={styles.logoItem}>Global Electronics Inc.</div>
            <div className={styles.logoItem}>Meridian Manufacturing</div>
            <div className={styles.logoItem}>NorthStar Consumer Goods</div>
            <div className={styles.logoItem}>Westfield Logistics</div>
            <div className={styles.logoItem}>AquaFlow Industries</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;