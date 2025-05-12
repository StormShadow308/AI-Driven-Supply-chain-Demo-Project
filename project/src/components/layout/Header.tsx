import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      event.preventDefault();
      const id = path.substring(2); // Remove '/#'
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn(`Element with ID '${id}' not found for path '${path}'.`);
      }
      // For mobile menu, close it after clicking a link
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
  };
  
  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/#features' },
    { label: 'Pricing', path: '/#pricing' },
    { label: 'About', path: '/#about' },
    { label: 'Contact', path: '/#contact' },
  ];
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [pathname]);
  
  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logoContainer}>
          <Link to="/">
            <Logo size="medium" />
          </Link>
        </div>
        
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navigationItems.map((item, index) => (
              <li key={index} className={styles.navItem}>
                <Link 
                  to={item.path} 
                  className={`${styles.navLink} ${pathname === item.path ? styles.active : ''}`}
                  onClick={(e) => handleNavClick(e, item.path)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={styles.authButtons}>
          <Link to="/auth" className={styles.loginButton}>Log in</Link>
          
        </div>
        
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      <div className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileNavContent}>
          <ul className={styles.mobileNavList}>
            {navigationItems.map((item, index) => (
              <li key={index} className={styles.mobileNavItem}>
                <Link 
                  to={item.path} 
                  className={styles.mobileNavLink}
                  onClick={(e) => {
                    handleNavClick(e, item.path);
                    // setIsMenuOpen(false); // Already handled in handleNavClick for mobile
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className={styles.mobileAuthButtons}>
            <Link to="/auth" className={styles.mobileLoginButton}>Log in</Link>
            
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;