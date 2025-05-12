
import { useState, useEffect } from 'react';

// Define standard breakpoints for the app
const BREAKPOINTS = {
  mobile: 768,  // Below 768px is mobile
  tablet: 1024, // 768px-1024px is tablet
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    };

    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const useIsTablet = () => {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= BREAKPOINTS.mobile && window.innerWidth < BREAKPOINTS.tablet);
    };

    // Initial check
    checkTablet();
    
    // Add event listener
    window.addEventListener('resize', checkTablet);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkTablet);
  }, []);

  return isTablet;
};

// New hook to provide all breakpoints at once
export const useBreakpoints = () => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = !isMobile && !isTablet;
  
  return { isMobile, isTablet, isDesktop };
};
