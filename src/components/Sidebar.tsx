import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  CircleAlert,
  MessageSquare,
  LayoutGrid,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockDepartments } from '@/utils/dataProcessor';
import { useAppState } from '@/App';
import Logo from '@/components/common/Logo';

type SidebarItem = {
  title: string;
  icon: any;
  path: string;
};

const mainItems: SidebarItem[] = [
  { title: 'Upload Data', icon: FileUp, path: '/upload' },

];

const analyticsItems: SidebarItem[] = [
  { title: 'Sales Analysis', icon: BarChart3, path: '/analytics/sales' },
  { title: 'Reviews Analysis', icon: MessageSquare, path: '/analytics/reviews' },
  { title: 'Joint Dashboard', icon: LayoutGrid, path: '/joint-dashboard' },
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
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { departmentStates } = useAppState(); // Get departmentStates from context
  const [activeDepartments, setActiveDepartments] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the viewport is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Set CSS variable for sidebar width to use in main content padding
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '64px' : '256px');
  }, [collapsed]);

  // Get active departments from AppStateContext
  useEffect(() => {
    if (departmentStates) {
      setActiveDepartments(Object.keys(departmentStates));
    }
  }, [departmentStates]);

  // Create department items dynamically
  const departmentItems = activeDepartments.map(dept => ({
    title: dept,
    icon: departmentIcons[dept] || ShoppingCart,
    path: `/department/${dept.toLowerCase().replace(/\s+/g, '-')}`
  }));
  
  // Handle navigation with state preservation
  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path, { state: { preserveState: true } });
  };

  // Handle mouse enter
  const handleMouseEnter = () => {
    if (!isMobile) {
      setCollapsed(false);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (!isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <>
      <aside 
        className={cn(
          "h-screen bg-background transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 flex flex-col",
          "border-r border-r-primary/10 shadow-lg",
          collapsed ? "w-16" : "w-64",
          isMobile && collapsed && "w-0 -translate-x-full"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-center h-16 px-4 border-b border-primary/10">
          <Link to="/" onClick={handleNavigation('/')} className="flex items-center">
            {collapsed && !isMobile ? (
                <Logo size="small" />
            ) : (
                <Logo size="medium" />
            )}
          </Link>
        </div>
        
        <div className="flex flex-col flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-medium text-primary/80 uppercase tracking-wider px-4 mb-2">
                Main
              </p>
            )}
            {mainItems.map((item) => (
              <Link 
                key={item.title}
                to={item.path}
                onClick={handleNavigation(item.path)}
                className={cn(
                  "flex items-center rounded-lg text-foreground transition-colors duration-200",
                  "px-3 py-2.5 font-medium",
                  location.pathname === item.path 
                    ? "bg-primary/20 text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon size={18} className={cn(
                  collapsed ? "" : "mr-3",
                  location.pathname === item.path ? "text-primary" : ""
                )} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
          
          <div className="space-y-1 pt-6">
            {!collapsed && (
              <p className="text-xs font-medium text-primary/80 uppercase tracking-wider px-4 mb-2">
                Analytics
              </p>
            )}
            {analyticsItems.map((item) => (
              <Link 
                key={item.title}
                to={item.path}
                onClick={handleNavigation(item.path)}
                className={cn(
                  "flex items-center rounded-lg text-foreground transition-colors duration-200",
                  "px-3 py-2.5 font-medium",
                  location.pathname === item.path 
                    ? "bg-primary/20 text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon size={18} className={cn(
                  collapsed ? "" : "mr-3",
                  location.pathname === item.path ? "text-primary" : ""
                )} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Settings Link Removed */}
      </aside>
    </>
  );
};

export default Sidebar;
