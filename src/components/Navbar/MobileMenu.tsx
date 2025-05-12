import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Home, 
  Users, 
  Truck, 
  FileUp, 
  BarChart3, 
  LineChart, 
  PieChart,
  Settings,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarItem = {
  title: string;
  icon: any;
  path: string;
};

const mainItems: SidebarItem[] = [
  { title: 'Dashboard', icon: Home, path: '/' },
  { title: 'Departments', icon: Users, path: '/departments' },
  { title: 'Logistics', icon: Truck, path: '/logistics' },
  { title: 'Upload Data', icon: FileUp, path: '/upload' },
];

const analyticsItems: SidebarItem[] = [
  { title: 'Sales Analysis', icon: BarChart3, path: '/analytics/sales' },
  { title: 'Performance', icon: LineChart, path: '/analytics/performance' },
  { title: 'Distribution', icon: PieChart, path: '/analytics/distribution' },
];

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const [activeDepartments, setActiveDepartments] = useState<string[]>([]);
  const location = useLocation();

  // Get active departments from localStorage
  useEffect(() => {
    const storedDepartments = localStorage.getItem('activeDepartments');
    if (storedDepartments) {
      setActiveDepartments(JSON.parse(storedDepartments));
    }
  }, []);

  // Create department items dynamically
  const departmentItems = activeDepartments.map(dept => ({
    title: dept,
    icon: ShoppingCart,
    path: `/department/${dept.toLowerCase().replace(/\s+/g, '-')}`
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2 rounded-full">
          <Menu size={20} />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-0 w-64 max-w-[90vw]">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-secondary/20">
            <Link to="/" className="text-white font-bold text-lg flex items-center" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 reactor-glow">
                <div className="w-4 h-4 rounded-full bg-accent animate-reactor-pulse"></div>
              </div>
              <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                StarkLine
              </span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="flex flex-col flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {/* Main Items */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-secondary uppercase tracking-wider px-4 mb-2">
                Main Systems
              </p>
              {mainItems.map((item) => (
                <Link 
                  key={item.title}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg text-sidebar-foreground transition-colors duration-200",
                    "px-3 py-2.5 font-medium",
                    location.pathname === item.path 
                      ? "bg-primary/20 text-white border-l-2 border-l-primary" 
                      : "hover:bg-white/5 text-white/80"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "mr-3",
                    location.pathname === item.path ? "text-accent" : ""
                  )} />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
            
            {/* Analytics Items */}
            <div className="space-y-1 pt-6">
              <p className="text-xs font-medium text-secondary uppercase tracking-wider px-4 mb-2">
                Analytics
              </p>
              {analyticsItems.map((item) => (
                <Link 
                  key={item.title}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg text-sidebar-foreground transition-colors duration-200",
                    "px-3 py-2.5 font-medium",
                    location.pathname === item.path 
                      ? "bg-primary/20 text-white border-l-2 border-l-primary" 
                      : "hover:bg-white/5 text-white/80"
                  )}
                >
                  <item.icon size={18} className={cn(
                    "mr-3",
                    location.pathname === item.path ? "text-accent" : ""
                  )} />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>
            
            {/* Departments */}
            {activeDepartments.length > 0 && (
              <div className="space-y-1 pt-6">
                <p className="text-xs font-medium text-secondary uppercase tracking-wider px-4 mb-2">
                  Departments
                </p>
                {departmentItems.map((item) => (
                  <Link 
                    key={item.title}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center rounded-lg text-sidebar-foreground transition-colors duration-200",
                      "px-3 py-2.5 font-medium",
                      location.pathname === item.path 
                        ? "bg-primary/20 text-white border-l-2 border-l-primary" 
                        : "hover:bg-white/5 text-white/80"
                    )}
                  >
                    <item.icon size={18} className={cn(
                      "mr-3",
                      location.pathname === item.path ? "text-accent" : ""
                    )} />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Settings */}
          <div className="p-3 mt-auto border-t border-secondary/20">
            <Link 
              to="/settings"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center rounded-lg text-sidebar-foreground font-medium transition-colors duration-200",
                "px-3 py-2.5 hover:bg-white/5 text-white/80",
                location.pathname === '/settings' ? "bg-primary/20 text-white border-l-2 border-l-primary" : ""
              )}
            >
              <Settings size={18} className={cn(
                "mr-3",
                location.pathname === '/settings' ? "text-accent" : ""
              )} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
