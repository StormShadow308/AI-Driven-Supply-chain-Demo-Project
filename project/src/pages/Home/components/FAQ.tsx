import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  toggleOpen: () => void;
  delay: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ 
  question, 
  answer, 
  isOpen, 
  toggleOpen,
  delay 
}) => {
  return (
    <motion.div 
      className={styles.faqItem}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <button 
        className={`${styles.faqQuestion} ${isOpen ? styles.open : ''}`}
        onClick={toggleOpen}
      >
        <span>{question}</span>
        <ChevronDown size={20} className={`${styles.icon} ${isOpen ? styles.rotate : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.faqAnswer}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.faqAnswerInner}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  const faqs = [
    {
      question: "How does ChainSight's AI improve supply chain forecasting?",
      answer: "ChainSight's AI algorithms analyze historical data, market trends, and external factors (like weather and economic indicators) to generate highly accurate demand forecasts. Our models continually learn and improve from new data, achieving up to 94% accuracy in most industries."
    },
    {
      question: "Can ChainSight integrate with our existing systems?",
      answer: "Yes, ChainSight is designed to integrate seamlessly with most ERP systems, warehouse management systems, transportation management systems, and other supply chain software. We provide pre-built connectors for popular platforms like SAP, Oracle, Microsoft Dynamics, and many others."
    },
    {
      question: "How long does implementation take?",
      answer: "For most companies, a basic implementation can be completed in 2-4 weeks. More complex implementations with custom integrations and model training may take 6-8 weeks. Our team works closely with your IT department to ensure a smooth transition."
    },
    {
      question: "Is our supply chain data secure on ChainSight's platform?",
      answer: "Absolutely. We maintain the highest security standards with SOC 2 Type II certification, end-to-end encryption, and regular penetration testing. Your data is stored in secure, compliant data centers, and we never share your data with third parties."
    },
    {
      question: "Can we customize the dashboards and reports?",
      answer: "Yes, ChainSight offers extensive customization options. You can create custom dashboards, reports, and KPIs that align with your specific business needs. Our platform also supports role-based access control so different team members can see the information most relevant to their responsibilities."
    },
    {
      question: "Do you offer training and support?",
      answer: "Yes, all plans include comprehensive training and support. The Professional and Enterprise plans include dedicated account managers and priority support. We also provide regular webinars, documentation, and a knowledge base to help your team get the most from the platform."
    }
  ];
  
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <p className={styles.sectionSubtitle}>
            Get answers to common questions about our supply chain platform.
          </p>
        </motion.div>
        
        <div className={styles.faqContainer}>
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              toggleOpen={() => toggleFAQ(index)}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        <motion.div 
          className={styles.moreFaq}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>Still have questions?</p>
          <button onClick={() => navigate('/auth')} className={styles.contactLink}>Check for Yourself</button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;