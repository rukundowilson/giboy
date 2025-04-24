"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'
import styles from "./page.module.css"

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update password strength when password field changes
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!acceptTerms) {
        throw new Error('Please accept the terms and conditions');
      }

      if (passwordStrength < 3) {
        throw new Error('Please use a stronger password');
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        
        <h1 className={styles.authTitle}>Create your account</h1>
        <p className={styles.authSubtitle}>Join Giboy for the best in baby fashion</p>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.nameFields}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.formLabel}>First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.formLabel}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className={styles.formInput}
                required
              />
            </div>
          </div>
          
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
              placeholder="Create a password"
              className={styles.formInput}
              required
              minLength={8}
            />
            {formData.password && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthMeter}>
                  <div 
                    className={styles.strengthIndicator} 
                    style={{ 
                      width: `${passwordStrength * 25}%`,
                      backgroundColor: 
                        passwordStrength === 0 ? '#f56565' : 
                        passwordStrength === 1 ? '#ed8936' :
                        passwordStrength === 2 ? '#ecc94b' :
                        passwordStrength === 3 ? '#48bb78' : 
                        '#38a169'
                    }}
                  ></div>
                </div>
                <span className={styles.strengthText}>
                  {passwordStrength === 0 && 'Very weak'}
                  {passwordStrength === 1 && 'Weak'}
                  {passwordStrength === 2 && 'Medium'}
                  {passwordStrength === 3 && 'Strong'}
                  {passwordStrength === 4 && 'Very strong'}
                </span>
              </div>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`${styles.formInput} ${
                formData.confirmPassword && 
                formData.password !== formData.confirmPassword ? 
                styles.inputError : ''
              }`}
              required
            />
            {formData.confirmPassword && 
             formData.password !== formData.confirmPassword && (
              <p className={styles.errorText}>Passwords do not match</p>
            )}
          </div>
          
          <div className={styles.termsCheckbox}>
            <input
              type="checkbox"
              id="acceptTerms"
              checked={acceptTerms}
              onChange={() => setAcceptTerms(!acceptTerms)}
              className={styles.checkbox}
              required
            />
            <label htmlFor="acceptTerms">
              I agree to the{' '}
              <Link href="/terms" className={styles.authLink}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className={styles.authLink}>
                Privacy Policy
              </Link>
            </label>
          </div>
          
          <button 
            type="submit" 
            className={`${styles.authButton} ${loading ? styles.loading : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form> 
        
        <p className={styles.switchAuth}>
          Already have an account?{' '}
          <Link href="/login" className={styles.authLink}>
            Log in
          </Link>
        </p>
      </div>
      
      <div className={styles.authImageContainer}>
        <Image
          src="/images/pic1.jpeg"
          alt="Happy baby in Giboy clothing"
          fill
          objectFit="cover"
          className={styles.authImage}
        />
        <div className={styles.authImageOverlay}>
          <div className={styles.authImageContent}>
            <h2>Welcome to the Giboy Family</h2>
            <p>Create an account to explore our adorable collection and enjoy exclusive benefits</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;