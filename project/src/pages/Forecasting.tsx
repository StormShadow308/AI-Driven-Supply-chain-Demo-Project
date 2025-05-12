import React from 'react';
import { LineChart, TrendingUp, Activity, Calendar } from 'lucide-react';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import AreaChart from '../components/charts/AreaChart';
import styles from './Pages.module.css';

const Forecasting: React.FC = () => {
  const forecastData = [45, 52, 49, 58, 63, 67, 72, 75, 78, 82, 85, 89];
  const forecastLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Demand Forecasting</h1>
          <p className={styles.pageDescription}>
            AI-powered demand predictions and trend analysis
          </p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton}>Export Forecast</button>
          <button className={styles.primaryButton}>Update Models</button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Forecast Accuracy"
          value="94.2%"
          change={2.5}
          trend="up"
          icon={<TrendingUp size={18} />}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Prediction Horizon"
          value="90 days"
          icon={<Calendar size={18} />}
          subtitle="Rolling forecast"
        />
        <MetricCard
          title="Model Performance"
          value="0.89"
          change={0.05}
          trend="up"
          icon={<Activity size={18} />}
          subtitle="R² Score"
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card
          title="Demand Forecast"
          subtitle="12-month prediction"
          icon={<LineChart size={20} />}
          fullHeight
        >
          <AreaChart
            data={forecastData}
            labels={forecastLabels}
            height={300}
            color="#0ea5e9"
          />
        </Card>
      </div>
    </div>
  );
};

export default Forecasting;