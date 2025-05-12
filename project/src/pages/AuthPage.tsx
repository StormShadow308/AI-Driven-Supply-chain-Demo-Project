import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthPage.module.css';
import Logo from '../components/layout/Logo'; // Corrected path
import { Link } from 'react-router-dom';
import { ReactComponent as UserIcon } from '../assets/icons/user.svg';
import { ReactComponent as EmailIcon } from '../assets/icons/email.svg';
import { ReactComponent as LockIcon } from '../assets/icons/lock.svg';

// Firebase imports
import { auth, googleProvider } from '../firebase'; // Import auth and googleProvider from your firebase.ts file
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup, // Added for Google Sign-In
  // updateProfile // If you want to set display name after signup
} from 'firebase/auth';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mapFirebaseError = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Please sign up or try a different email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please log in or use a different email address.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Access to this account has been temporarily disabled due to many failed login attempts. Please try again later or reset your password.';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet connection and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError(null); // Clear errors when toggling
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Note: Firebase uses email for login, not username. 
      // If you intend to use username, you'll need a different approach (e.g., Firestore lookup)
      // For now, assuming the 'login-username' field is intended for email.
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      window.location.href = 'http://localhost:8080/'; // Correct redirect to the root of the dashboard
    } catch (err: any) {
      console.error('Login error:', err.code, err.message);
      setError(mapFirebaseError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Optionally, update the user's profile with the full name
      // if (userCredential.user) {
      //   await updateProfile(userCredential.user, { displayName: fullName });
      // }
      console.log('Signup successful:', userCredential.user);
      window.location.href = 'http://localhost:8080/'; // Correct redirect to the root of the dashboard
    } catch (err: any) {
      console.error('Signup error:', err.code, err.message);
      setError(mapFirebaseError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      console.log('Google Sign-In successful:', userCredential.user);
      window.location.href = 'http://localhost:8080/'; // Correct redirect to the root of the dashboard
    } catch (err: any) {
      console.error('Google Sign-In error:', err.code, err.message);
      setError(mapFirebaseError(err.code || ''));
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -100 : 100 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: isLogin ? 100 : -100 }
  };

  // Using public folder paths for background images
  const loginBgUrl = 'url(/images/login-background.png)';
  const signupBgUrl = 'url(/images/signup-background.png)';

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.logoContainer}>
         <Link to="/"> <Logo size="large" /> </Link>
        </div>
        <h2 className={styles.title}>{isLogin ? 'Login' : 'Create Account'}</h2>
        <div className={styles.formWrapper}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                className={styles.form}
                onSubmit={handleLoginSubmit}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.inputGroup}>
                  <label htmlFor="login-email">Email</label>
                  <input 
                    type="email" 
                    id="login-email" 
                    placeholder="Email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  <div className={styles.inputIcon}>
                    <EmailIcon />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="login-password">Password</label>
                  <input 
                    type="password" 
                    id="login-password" 
                    placeholder="Password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <div className={styles.inputIcon}>
                    <LockIcon />
                  </div>
                </div>
                <div className={styles.optionsContainer}>
                  <div className={styles.rememberMe}>
                    <input type="checkbox" id="remember-me" />
                    <label htmlFor="remember-me">Remember Me</label>
                  </div>
                  <a href="#" className={styles.forgotPassword}>Forget Password</a>
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <p className={styles.toggleText}>
                  Don't have an account?{' '}
                  <button type="button" onClick={toggleForm} className={styles.toggleButton} disabled={loading}>
                    Register
                  </button>
                </p>

                {/* Google Sign-In Button */}
                <div className={styles.divider}>OR</div>
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  className={`${styles.submitButton} ${styles.googleButton}`} 
                  disabled={loading}
                >
                  {loading && !isLogin ? 'Processing...' : 'Sign in with Google'} {/* Adjust loading text if needed */}
                </button>

              </motion.form>
            ) : (
              <motion.form
                key="signup"
                className={styles.form}
                onSubmit={handleSignupSubmit}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {error && <p className={styles.errorMessage}>{error}</p>}
                <div className={styles.inputGroup}>
                  <label htmlFor="signup-name">Full Name</label>
                  <input 
                    type="text" 
                    id="signup-name" 
                    placeholder="Full Name" 
                    required 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                  />
                  <div className={styles.inputIcon}>
                    <UserIcon />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="signup-email">Email</label>
                  <input 
                    type="email" 
                    id="signup-email" 
                    placeholder="Email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  <div className={styles.inputIcon}>
                    <EmailIcon />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="signup-password">Password</label>
                  <input 
                    type="password" 
                    id="signup-password" 
                    placeholder="Password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <div className={styles.inputIcon}>
                    <LockIcon />
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                  <input 
                    type="password" 
                    id="signup-confirm-password" 
                    placeholder="Confirm Password" 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  <div className={styles.inputIcon}>
                    <LockIcon />
                  </div>
                </div>
                <button type="submit" className={styles.submitButton} disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                <p className={styles.toggleText}>
                  Already have an account?{' '}
                  <button type="button" onClick={toggleForm} className={styles.toggleButton} disabled={loading}>
                    Log In
                  </button>
                </p>

                {/* Google Sign-In Button */}
                <div className={styles.divider}>OR</div>
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn} 
                  className={`${styles.submitButton} ${styles.googleButton}`} 
                  disabled={loading}
                >
                  {loading && isLogin ? 'Processing...' : 'Sign up with Google'} {/* Adjust loading text if needed */}
                </button>

              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div 
        className={styles.backgroundImage}
        style={{
          backgroundImage: isLogin ? loginBgUrl : signupBgUrl
        }}
      ></div>
    </div>
  );
};

export default AuthPage;