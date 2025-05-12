import React from 'react';
import { AlertTriangle, Shield, Zap, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import AreaChart from '../components/charts/AreaChart';
import styles from './Pages.module.css';

const Risk: React.FC = () => {
  const riskData = [12, 15, 18, 14, 11, 9, 7, 8, 11, 13, 10, 8];
  const riskLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Risk Management</h1>
          <p className={styles.pageDescription}>
            Proactive risk monitoring and mitigation
          </p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton}>Risk Report</button>
          <button className={styles.primaryButton}>Analyze Threats</button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Risk Index"
          value="8.2"
          change={-2.1}
          trend="up"
          icon={<AlertTriangle size={18} />}
          subtitle="Lower is better"
        />
        <MetricCard
          title="Threat Level"
          value="Low"
          icon={<Shield size={18} />}
          subtitle="Current status"
        />
        <MetricCard
          title="Active Alerts"
          value="3"
          change={-2}
          trend="up"
          icon={<AlertCircle size={18} />}
          subtitle="Requiring attention"
        />
        <MetricCard
          title="Response Time"
          value="1.8h"
          change={-0.5}
          trend="up"
          icon={<Zap size={18} />}
          subtitle="Average"
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card
          title="Risk Trends"
          subtitle="12-month risk index"
          icon={<AlertTriangle size={20} />}
          fullHeight
        >
          <AreaChart
            data={riskData}
            labels={riskLabels}
            height={300}
            color="#ef4444"
          />
        </Card>
      </div>
    </div>
  );
};

export default Risk;