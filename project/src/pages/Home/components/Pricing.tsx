import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import styles from './Pricing.module.css';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  isPopular?: boolean;
}

const Pricing: React.FC = () => {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();
  
  const plans: PricingPlan[] = [
    {
      name: "Starter",
      price: billing === 'monthly' ? "$299" : "$249",
      description: "Perfect for small businesses with basic supply chain needs",
      features: [
        { text: "Demand forecasting (30 days)", included: true },
        { text: "Basic inventory optimization", included: true },
        { text: "Standard dashboards", included: true },
        { text: "Email support", included: true },
        { text: "Network optimization", included: false },
        { text: "Risk assessment", included: false },
        { text: "Custom AI models", included: false },
      ],
      buttonText: "Get Started"
    },
    {
      name: "Professional",
      price: billing === 'monthly' ? "$599" : "$499",
      description: "Ideal for medium businesses with complex supply chains",
      features: [
        { text: "Advanced forecasting (90 days)", included: true },
        { text: "Dynamic inventory optimization", included: true },
        { text: "Custom dashboards", included: true },
        { text: "Priority support", included: true },
        { text: "Network optimization", included: true },
        { text: "Risk assessment", included: true },
        { text: "Custom AI models", included: false },
      ],
      buttonText: "Get Started",
      isPopular: true
    },
    {
      name: "Enterprise",
      price: billing === 'monthly' ? "$1,299" : "$999",
      description: "For large organizations with global supply chains",
      features: [
        { text: "Predictive forecasting (365 days)", included: true },
        { text: "Multi-echelon inventory optimization", included: true },
        { text: "Unlimited custom dashboards", included: true },
        { text: "24/7 dedicated support", included: true },
        { text: "Advanced network optimization", included: true },
        { text: "Proactive risk management", included: true },
        { text: "Custom AI models", included: true },
      ],
      buttonText: "Get Started"
    }
  ];

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>
        <motion.div 
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={styles.sectionTitle}>Transparent Pricing for Every Scale</h2>
          <p className={styles.sectionSubtitle}>
            Choose the plan that's right for your business.
          </p>
          
          <div className={styles.billingToggle}>
            <span className={billing === 'monthly' ? styles.active : ''}>Monthly</span>
            <div className={styles.toggle} onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}>
              <div className={`${styles.toggleBall} ${billing === 'annual' ? styles.toggleRight : ''}`}></div>
            </div>
            <span className={billing === 'annual' ? styles.active : ''}>Annual (Save 20%)</span>
          </div>
        </motion.div>
        
        <div className={styles.plansContainer}>
          {plans.map((plan, index) => (
            <motion.div 
              key={index}
              className={`${styles.planCard} ${plan.isPopular ? styles.popularPlan : ''}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.isPopular && <div className={styles.popularBadge}>Most Popular</div>}
              <div className={styles.planHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.planPrice}>
                  <span className={styles.currency}>$</span>
                  {plan.price.replace('$', '')}
                  <span className={styles.period}>/ month</span>
                </div>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>
              
              <ul className={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <li 
                    key={idx} 
                    className={`${styles.featureItem} ${!feature.included ? styles.disabledFeature : ''}`}
                  >
                    <span className={styles.featureIcon}>
                      <Check size={16} />
                    </span>
                    <span className={styles.featureText}>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`${styles.planButton} ${plan.isPopular ? styles.primaryButton : styles.secondaryButton}`}
                onClick={() => navigate('/auth')}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className={styles.enterpriseCallout}>
          <motion.div 
            className={styles.calloutContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h3 className={styles.calloutTitle}>Need a custom solution?</h3>
              <p className={styles.calloutDescription}>
              Get Started to Optimize Your Sales and Access a Personalized Dashboard
              Explore our publicly available demo dashboard now.
              </p>
            </div>
            <button className={styles.calloutButton} onClick={() => navigate('/auth')}>Signup Now</button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;