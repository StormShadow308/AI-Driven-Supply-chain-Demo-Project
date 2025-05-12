import React from 'react';
import { Network as NetworkIcon, Activity, Users, Box } from 'lucide-react';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import BarChart from '../components/charts/BarChart';
import styles from './Pages.module.css';

const Network: React.FC = () => {
  const networkData = [92, 88, 95, 89, 87, 93, 96, 94, 91, 89, 92, 95];
  const networkLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Network Analysis</h1>
          <p className={styles.pageDescription}>
            Supply chain network performance and optimization
          </p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton}>View Map</button>
          <button className={styles.primaryButton}>Optimize Routes</button>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          title="Network Efficiency"
          value="92%"
          change={1.5}
          trend="up"
          icon={<NetworkIcon size={18} />}
          subtitle="Overall score"
        />
        <MetricCard
          title="Active Nodes"
          value="247"
          change={12}
          trend="up"
          icon={<Activity size={18} />}
          subtitle="Across all regions"
        />
        <MetricCard
          title="Connected Partners"
          value="89"
          icon={<Users size={18} />}
          subtitle="Suppliers & distributors"
        />
        <MetricCard
          title="Inventory Nodes"
          value="156"
          icon={<Box size={18} />}
          subtitle="Warehouses & hubs"
        />
      </div>

      <div className={styles.chartsGrid}>
        <Card
          title="Network Performance"
          subtitle="Monthly efficiency metrics"
          icon={<NetworkIcon size={20} />}
          fullHeight
        >
          <BarChart
            data={networkData}
            labels={networkLabels}
            height={300}
            color="#8b5cf6"
          />
        </Card>
      </div>
    </div>
  );
};

export default Network;