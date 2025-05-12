
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItemProps {
  title: string;
  icon: LucideIcon;
  path: string;
  isActive: boolean;
  collapsed: boolean;
}

const NavigationItem = ({ 
  title, 
  icon: Icon, 
  path, 
  isActive, 
  collapsed 
}: NavigationItemProps) => {
  return (
    <Link 
      key={title}
      to={path}
      className={cn(
        "group flex items-center rounded-lg transition-colors duration-200",
        "px-3 py-2.5 font-medium",
        isActive 
          ? "bg-primary/20 text-sidebar-active-foreground border-l-2 border-l-primary" // Active state remains the same
          : "text-sidebar-foreground hover:bg-accent/10", // Rely on theme variable for foreground color
        collapsed && "justify-center"
      )}
    >
      <Icon size={18} className={cn(
        collapsed ? "" : "mr-3",
        // Rely on parent's text color for inactive state, explicitly set active color
        isActive 
          ? "text-sidebar-active-foreground" // Active icon color
          : "text-sidebar-foreground" // Rely on theme variable for icon color
      )} />
      {!collapsed && <span>{title}</span>}
    </Link>
  );
};

export default NavigationItem;
