import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from './Logo';
import MobileMenu from './MobileMenu';
import Search from './Search';
import UserMenu from './UserMenu';

const Navbar = () => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <nav className="bg-card/30 backdrop-blur-lg border-b border-primary/10 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 w-full">
      <div className="flex items-center">
        {isMobile && <MobileMenu />}
        <Logo />
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        {!mobileSearchOpen && (
          <>
            <Search 
              mobileSearchOpen={mobileSearchOpen} 
              setMobileSearchOpen={setMobileSearchOpen} 
              isMobile={isMobile} 
            />
            <UserMenu />
          </>
        )}
        {mobileSearchOpen && isMobile && (
          <Search 
            mobileSearchOpen={mobileSearchOpen} 
            setMobileSearchOpen={setMobileSearchOpen} 
            isMobile={isMobile} 
          />
        )}
      </div>
    </nav>
  );
};

export default Navbar;
