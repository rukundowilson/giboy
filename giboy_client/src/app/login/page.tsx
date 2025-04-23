"use client"

// components/auth/Login.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (formData.email && formData.password) {
        router.push('/');
      } else {
        throw new Error('Please enter both email and password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/teddy.jpg"
            alt="Giboy Logo" 
            width={120} 
            height={40} 
            className={styles.logo}
          />
        </div>
        
        <h1 className={styles.authTitle}>Log in to your account</h1>
        <p className={styles.authSubtitle}>Welcome back! Please enter your details</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formOptions}>
            <div className={styles.rememberMe}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className={styles.checkbox}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className={`${styles.authButton} ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div className={styles.divider}>
        </div>        
        <p className={styles.switchAuth}>
          Don't have an account?{' '}
          <Link href="/register" className={styles.authLink}>
            Sign up
          </Link>
        </p>
      </div>
      
      <div className={styles.authImageContainer}>
        <Image
          src="/images/pic1.jpeg"
          alt="Cute baby in Giboy clothing"
          fill
          objectFit="cover"
          className={styles.authImage}
        />
        <div className={styles.authImageOverlay}>
          <div className={styles.authImageContent}>
            <h2>Welcome to Giboy</h2>
            <p>The finest selection of baby clothing for your little ones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;