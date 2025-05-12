import React, { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
// import Navbar from './Navbar'; // Navbar removed
import { Button } from '@/components/ui/button';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';

// Firebase imports
import { auth } from '../firebase'; // Changed to relative path
import { signOut } from 'firebase/auth';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarWidth, setSidebarWidth] = useState('256px');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      // Redirect to the login page of the 'project' app
      // Assuming the 'project' app (auth pages) runs on port 5173
      window.location.href = 'http://localhost:5173/auth'; 
    } catch (error) {
      console.error('Error signing out: ', error);
      // Optionally, display an error message to the user
    }
  };
  
  // Listen for changes to the CSS variable for sidebar width
  useEffect(() => {
    const updateSidebarWidth = () => {
      const width = getComputedStyle(document.documentElement)
        .getPropertyValue('--sidebar-width').trim();
      setSidebarWidth(width);
    };
    
    // Initial update
    updateSidebarWidth();
    
    // Set up a mutation observer to watch for changes to the CSS variables
    const observer = new MutationObserver(updateSidebarWidth);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['style'] 
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div 
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarWidth,
          width: `calc(100% - ${sidebarWidth})` 
        }}
      >
        {/* <Navbar /> */ /* Navbar removed */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Theme Toggle and Logout Buttons */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {mounted && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="transition-transform duration-500 ease-in-out transform hover:rotate-180" />
                ) : (
                  <Moon size={20} className="transition-transform duration-500 ease-in-out transform hover:rotate-180" />
                )}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut size={20} />
            </Button>
          </div>
          
          <div className="max-w-full pt-10"> {/* Added padding-top to avoid overlap */} 
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;