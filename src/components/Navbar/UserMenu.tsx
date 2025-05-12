import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

const UserMenu = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell size={20} />
      </Button>
      
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
  );
};

export default UserMenu;
