import React from 'react';
import { TrendingUp, PackageCheck, Truck, AlertTriangle, Timer, BarChart3, Network } from 'lucide-react';
import Card from '../components/ui/Card';
import MetricCard from '../components/dashboard/MetricCard';
import AreaChart from '../components/charts/AreaChart';
import BarChart from '../components/charts/BarChart';
import styles from './Pages.module.css';

const Dashboard: React.FC = () => {
  // Mock data for charts
  const demandData = [42, 45, 39, 55, 59, 58, 62, 68, 71, 75, 78, 72];
  const demandLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const inventoryData = [85, 78, 72, 58, 52, 55, 62, 70, 73, 80, 90, 85];
  const inventoryLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const deliveryData = [92, 94, 89, 86, 92, 95, 97, 95, 91, 94, 96, 97];
  const deliveryLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const riskData = [8, 12, 18, 15, 10, 7, 5, 9, 13, 15, 11, 7];
  const riskLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Supply Chain Dashboard</h1>
          <p className={styles.pageDescription}>
            Overview of your supply chain performance and key metrics
          </p>
        </div>
        <div className={styles.pageActions}>
          <button className={styles.secondaryButton}>Export Data</button>
          <button className={styles.primaryButton}>Generate Report</button>
        </div>
      </div>
      
      {/* Metrics Row */}
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
          title="Inventory Level"
          value="85.7%"
          change={-4.2}
          trend="down"
          icon={<PackageCheck size={18} />}
          subtitle="Capacity utilization"
        />
        <MetricCard
          title="On-Time Delivery"
          value="97.3%"
          change={1.8}
          trend="up"
          icon={<Truck size={18} />}
          subtitle="Last 30 days"
        />
        <MetricCard
          title="Supply Risk Index"
          value="8.2"
          change={-3.5}
          trend="up"
          icon={<AlertTriangle size={18} />}
          subtitle="Lower is better"
        />
      </div>
      
      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        <Card 
          title="Demand Forecast"
          subtitle="Monthly trend analysis"
          icon={<TrendingUp size={20} />}
          fullHeight
        >
          <AreaChart
            data={demandData}
            labels={demandLabels}
            height={220}
            color="#0ea5e9"
          />
        </Card>
        
        <Card 
          title="Inventory Levels"
          subtitle="Stock capacity percentage"
          icon={<PackageCheck size={20} />}
          fullHeight
        >
          <AreaChart
            data={inventoryData}
            labels={inventoryLabels}
            height={220}
            color="#10b981"
          />
        </Card>
      </div>
      
      {/* Bottom Charts Row */}
      <div className={styles.chartsGrid}>
        <Card 
          title="Delivery Performance"
          subtitle="On-time delivery percentage"
          icon={<Timer size={20} />}
          fullHeight
        >
          <BarChart
            data={deliveryData}
            labels={deliveryLabels}
            height={220}
            color="#8b5cf6"
          />
        </Card>
        
        <Card 
          title="Supply Chain Risk"
          subtitle="Risk index (lower is better)"
          icon={<AlertTriangle size={20} />}
          fullHeight
        >
          <BarChart
            data={riskData}
            labels={riskLabels}
            height={220}
            color="#f97316"
          />
        </Card>
      </div>
      
      {/* Bottom Cards Row */}
      <div className={styles.cardsGrid}>
        <Card 
          title="Recommended Actions"
          icon={<BarChart3 size={20} />}
          fullHeight
        >
          <ul className={styles.actionsList}>
            <li className={styles.actionItem}>
              <span className={styles.actionBadge} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>High</span>
              <span className={styles.actionText}>Optimize inventory levels at Northeast distribution center</span>
            </li>
            <li className={styles.actionItem}>
              <span className={styles.actionBadge} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>Medium</span>
              <span className={styles.actionText}>Review supplier performance for critical components</span>
            </li>
            <li className={styles.actionItem}>
              <span className={styles.actionBadge} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Low</span>
              <span className={styles.actionText}>Adjust demand forecast for seasonal products</span>
            </li>
            <li className={styles.actionItem}>
              <span className={styles.actionBadge} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Low</span>
              <span className={styles.actionText}>Evaluate new shipping route options for international deliveries</span>
            </li>
          </ul>
        </Card>
        
        <Card 
          title="Network Health"
          icon={<Network size={20} />}
          fullHeight
        >
          <div className={styles.networkGrid}>
            <div className={styles.networkItem}>
              <div className={styles.networkLabel}>Suppliers</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: '92%', backgroundColor: '#10b981' }}></div>
              </div>
              <div className={styles.networkValue}>92%</div>
            </div>
            <div className={styles.networkItem}>
              <div className={styles.networkLabel}>Distribution Centers</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: '87%', backgroundColor: '#10b981' }}></div>
              </div>
              <div className={styles.networkValue}>87%</div>
            </div>
            <div className={styles.networkItem}>
              <div className={styles.networkLabel}>Transportation</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: '78%', backgroundColor: '#f59e0b' }}></div>
              </div>
              <div className={styles.networkValue}>78%</div>
            </div>
            <div className={styles.networkItem}>
              <div className={styles.networkLabel}>Retail Locations</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: '95%', backgroundColor: '#10b981' }}></div>
              </div>
              <div className={styles.networkValue}>95%</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;