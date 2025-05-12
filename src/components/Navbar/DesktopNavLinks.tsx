
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, LineChart, PieChart } from 'lucide-react';

const DesktopNavLinks = () => {
  const location = useLocation();

  return (
    <div className="hidden md:flex space-x-4">
      <Link to="/" className={`text-primary/80 hover:text-primary transition-colors font-medium ${location.pathname === '/' ? 'text-primary' : ''}`}>
        Dashboard
      </Link>
      <Link to="/departments" className={`text-primary/80 hover:text-primary transition-colors font-medium ${location.pathname === '/departments' ? 'text-primary' : ''}`}>
        Departments
      </Link>
      <div className="relative group">
        <Link to="/analytics/sales" className={`text-primary/80 hover:text-primary transition-colors font-medium ${location.pathname.includes('/analytics') ? 'text-primary' : ''}`}>
          Analytics
        </Link>
        <div className="absolute left-0 mt-2 w-48 bg-sidebar rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
          <Link to="/analytics/sales" className="block px-4 py-2 text-primary/80 hover:bg-primary/10 hover:text-primary">
            <BarChart3 className="inline-block mr-2 h-4 w-4" />
            Sales Analytics
          </Link>
          <Link to="/analytics/performance" className="block px-4 py-2 text-primary/80 hover:bg-primary/10 hover:text-primary">
            <LineChart className="inline-block mr-2 h-4 w-4" />
            Performance
          </Link>
          <Link to="/analytics/distribution" className="block px-4 py-2 text-primary/80 hover:bg-primary/10 hover:text-primary">
            <PieChart className="inline-block mr-2 h-4 w-4" />
            Distribution
          </Link>
        </div>
      </div>
      <Link to="/compare" className={`text-primary/80 hover:text-primary transition-colors font-medium ${location.pathname === '/compare' ? 'text-primary' : ''}`}>
        Compare
      </Link>
    </div>
  );
};

export default DesktopNavLinks;
