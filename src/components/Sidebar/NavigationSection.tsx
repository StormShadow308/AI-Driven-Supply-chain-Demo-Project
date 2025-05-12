
import { cn } from '@/lib/utils';
import NavigationItem from './NavigationItem';
import { SidebarItem } from './types';

interface NavigationSectionProps {
  title: string;
  items: SidebarItem[];
  currentPath: string;
  collapsed: boolean;
}

const NavigationSection = ({ 
  title, 
  items, 
  currentPath, 
  collapsed 
}: NavigationSectionProps) => {
  return (
    <div className="space-y-1 pt-6">
      {!collapsed && (
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavigationItem
          key={item.title}
          title={item.title}
          icon={item.icon}
          path={item.path}
          isActive={currentPath === item.path}
          collapsed={collapsed}
        />
      ))}
    </div>
  );
};

export default NavigationSection;
