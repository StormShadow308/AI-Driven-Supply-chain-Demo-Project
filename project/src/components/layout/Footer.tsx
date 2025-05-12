import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import Logo from './Logo';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Logo size="medium" />
            <p className={styles.footerTagline}>
              Advanced supply chain intelligence powered by AI
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className={styles.socialLink} aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.linksColumn}>
              <h4 className={styles.columnTitle}>Product</h4>
              <ul className={styles.linksList}>
                <li><Link to="#">Features</Link></li>
                <li><Link to="#">Pricing</Link></li>
                <li><Link to="#">Integrations</Link></li>
                <li><Link to="#">Case Studies</Link></li>
                <li><Link to="#">Documentation</Link></li>
              </ul>
            </div>
            
            <div className={styles.linksColumn}>
              <h4 className={styles.columnTitle}>Company</h4>
              <ul className={styles.linksList}>
                <li><Link to="#">About Us</Link></li>
                <li><Link to="#">Team</Link></li>
                <li><Link to="#">Careers</Link></li>
                <li><Link to="#">Press</Link></li>
                <li><Link to="#">Partners</Link></li>
              </ul>
            </div>
            
            <div className={styles.linksColumn}>
              <h4 className={styles.columnTitle}>Resources</h4>
              <ul className={styles.linksList}>
                <li><Link to="#">Blog</Link></li>
                <li><Link to="#">Whitepapers</Link></li>
                <li><Link to="#">Webinars</Link></li>
                <li><Link to="#">Tutorials</Link></li>
                <li><Link to="#">Support</Link></li>
              </ul>
            </div>
            
            <div className={styles.linksColumn}>
              <h4 className={styles.columnTitle}>Contact</h4>
              <ul className={styles.contactList}>
                <li>
                  <Mail size={16} />
                  <span>info@chainsight.ai</span>
                </li>
                <li>
                  <Phone size={16} />
                  <span>+1 (800) 123-4567</span>
                </li>
                <li>
                  <MapPin size={16} />
                  <span>123 AI Boulevard, San Francisco, CA 94107</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} ChainSight. All rights reserved.
          </div>
          
          <div className={styles.legalLinks}>
            <Link to="#">Terms of Service</Link>
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;