import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  FileUp, 
  Home, 
  LineChart, 
  PieChart, 
  Settings, 
  Truck, 
  Users,
  ShoppingBag,
  Package,
  ShoppingCart,
  Utensils,
  Star,
  Music,
  Tv,
  Gamepad2,
  Zap,
  Shield,
  CircleAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarItem } from './types';
import SidebarHeader from './SidebarHeader';
import NavigationSection from './NavigationSection';
import NavigationItem from './NavigationItem';
import { useIsMobile } from '@/hooks/use-mobile';

// Define the navigation item groups
const mainItems: SidebarItem[] = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Departments', icon: Users, path: '/departments' },
  { title: 'Logistics', icon: Truck, path: '/logistics' },
  { title: 'Upload Data', icon: FileUp, path: '/upload' },
];

const analyticsItems: SidebarItem[] = [
  { title: 'Sales Analysis', icon: BarChart3, path: '/analytics/sales' },
  { title: 'Sales Insight', icon: Zap, path: '/analytics/sales-insight' },
  { title: 'Performance', icon: LineChart, path: '/analytics/performance' },
  { title: 'Distribution', icon: PieChart, path: '/analytics/distribution' },
];

// Map of department names to icons
const departmentIcons: Record<string, any> = {
  'Electronics': Zap,
  'Clothing': ShoppingBag,
  'Grocery': Utensils,
  'Home Goods': Home,
  'Sports & Outdoors': Truck,
  'Books': LineChart,
  'Movies & TV': Tv,
  'Music': Music,
  'Video Games': Gamepad2,
  'Beauty': Star,
  'Toys & Games': Gamepad2,
  'Defense': Shield,
  'Security': CircleAlert
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeDepartments, setActiveDepartments] = useState<string[]>([]);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Set CSS variable for sidebar width to use in main content padding
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '64px' : '256px');
  }, [collapsed]);

  // Get active departments from localStorage or use empty array as default
  useEffect(() => {
    const storedDepartments = localStorage.getItem('activeDepartments');
    if (storedDepartments) {
      setActiveDepartments(JSON.parse(storedDepartments));
    }
  }, []);

  // If on mobile, we hide the sidebar completely 
  if (isMobile) {
    return null;
  }

  // Create department items dynamically
  const departmentItems = activeDepartments.map(dept => ({
    title: dept,
    icon: departmentIcons[dept] || ShoppingCart,
    path: `/department/${dept.toLowerCase().replace(/\s+/g, '-')}`
  }));

  return (
    <aside 
      className={cn(
        "h-screen bg-sidebar transition-all duration-300 fixed left-0 top-0 z-40 flex flex-col shadow-md",
        collapsed ? "w-16" : "w-64"
      )}
      id="sidebar-content" // Added ID for potential iframe reference
    >
      <SidebarHeader collapsed={collapsed} setCollapsed={setCollapsed} />
      
      <div className="flex flex-col flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-medium text-secondary uppercase tracking-wider px-4 mb-2">
              Main Systems
            </p>
          )}
          {mainItems.map((item) => (
            <NavigationItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              path={item.path}
              isActive={location.pathname === item.path}
              collapsed={collapsed}
            />
          ))}
        </div>
        
        <NavigationSection 
          title="Analytics"
          items={analyticsItems}
          currentPath={location.pathname}
          collapsed={collapsed}
        />
        
        {activeDepartments.length > 0 && (
          <NavigationSection 
            title="Departments"
            items={departmentItems}
            currentPath={location.pathname}
            collapsed={collapsed}
          />
        )}
      </div>
      
      <div className="p-3 mt-auto border-t border-secondary/20">
        <NavigationItem
          title="Settings"
          icon={Settings}
          path="/settings"
          isActive={location.pathname === '/settings'}
          collapsed={collapsed}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
