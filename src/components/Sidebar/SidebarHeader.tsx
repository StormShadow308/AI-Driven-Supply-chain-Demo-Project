
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarHeader = ({ collapsed, setCollapsed }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
      {!collapsed && (
        <Link to="/" className="text-sidebar-foreground font-bold text-lg flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2 reactor-glow">
            <div className="w-4 h-4 rounded-full bg-accent animate-reactor-pulse"></div>
          </div>
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            StarkLine
          </span>
        </Link>
      )}
      {collapsed && (
        <div className="w-8 h-8 mx-auto rounded-full bg-primary flex items-center justify-center reactor-glow">
          <div className="w-4 h-4 rounded-full bg-accent animate-reactor-pulse"></div>
        </div>
      )}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="p-1.5 rounded-full hover:bg-accent/10 text-sidebar-foreground transition-colors ml-auto"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </div>
  );
};

export default SidebarHeader;
