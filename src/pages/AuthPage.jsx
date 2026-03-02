import React, { useState, useEffect } from 'react';
import { Sprout, Tractor, ArrowLeft } from 'lucide-react';
import { SignIn, SignUp } from "@clerk/clerk-react";
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AuthPage.module.css';

const AuthPage = () => {
    const location = useLocation();

    // Check if we arrived here looking to sign up specifically via URL hash or query
    const initialMode = location.hash === '#sign-up' || location.search.includes('mode=sign-up') ? 'sign-up' : 'sign-in';

    const [selectedRole, setSelectedRole] = useState(location.state?.role || null); // 'farmer' | 'provider' | null
    const [authMode, setAuthMode] = useState(initialMode); // 'sign-in' | 'sign-up'
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        // Save role to local storage or state management to be used in onboarding
        localStorage.setItem('userRole', role);
    };

    const handleBack = () => {
        setSelectedRole(null);
        localStorage.removeItem('userRole');
    };

    useEffect(() => {
        if (selectedRole) {
            localStorage.setItem('userRole', selectedRole);
        }
    }, [selectedRole]);

    useEffect(() => {
        if (location.hash === '#sign-up' || location.search.includes('mode=sign-up')) {
            setAuthMode('sign-up');
        } else if (location.hash === '#sign-in' || location.search.includes('mode=sign-in')) {
            setAuthMode('sign-in');
        }
    }, [location.hash, location.search]);

    return (
        <div className={styles.authContainer}>
            {/* Background Elements */}
            <div className={styles.bgBlobLeft}></div>
            <div className={styles.bgBlobRight}></div>

            <div className={styles.contentWrapper}>

                {/* Header */}
                <div className={styles.header}>
                    <h1 className={styles.logo} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>AgroW</h1>
                    <p className={styles.tagline}>
                        {!selectedRole
                            ? "Join the largest local farming community."
                            : selectedRole === 'farmer'
                                ? "Continue your farming journey with AgroW."
                                : "Grow your agricultural service business with AgroW."
                        }
                    </p>
                </div>

                {/* Step 1: Role Selection */}
                {!selectedRole && authMode !== 'sign-in' && (
                    <div className={styles.roleSelection}>
                        <h2 className={styles.sectionTitle}>Choose your role to get started</h2>

                        <div className={styles.cardsGrid}>
                            {/* Farmer Card */}
                            <button
                                className={styles.roleCard}
                                onClick={() => handleRoleSelect('farmer')}
                            >
                                <div className={styles.iconWrapper}>
                                    <Sprout size={48} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>Farmer</h3>
                                    <p>Ask farming questions, learn, and find nearby services</p>
                                </div>
                            </button>

                            {/* Service Provider Card */}
                            <button
                                className={`${styles.roleCard} ${styles.providerCard} `}
                                onClick={() => handleRoleSelect('provider')}
                            >
                                <div className={`${styles.iconWrapper} ${styles.iconProvider} `}>
                                    <Tractor size={48} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3>Service Provider</h3>
                                    <p>Offer tractor, machinery, or expert services to farmers</p>
                                </div>
                            </button>
                        </div>

                        <div className={styles.loginLink}>
                            Already have an account? <span onClick={() => { setAuthMode('sign-in'); window.history.pushState({}, '', '/auth?mode=sign-in'); }}>Log in</span>
                        </div>
                    </div>
                )}

                {/* Step 2: Auth Component (Clerk Integration) */}
                {(selectedRole || authMode === 'sign-in') && (
                    <div className={styles.authSection}>
                        {selectedRole && (
                            <button onClick={handleBack} className={styles.backButton}>
                                <ArrowLeft size={16} /> Change Role
                            </button>
                        )}

                        <div className={styles.clerkContainer}>
                            {authMode === 'sign-up' ? (
                                <SignUp
                                    redirectUrl="/onboarding"
                                    forceRedirectUrl="/onboarding"
                                    signInUrl="/auth?mode=sign-in"
                                />
                            ) : (
                                <SignIn
                                    redirectUrl="/dashboard"
                                    forceRedirectUrl="/dashboard"
                                    signUpUrl="/auth?mode=sign-up"
                                />
                            )}
                        </div>

                        {selectedRole && (
                            <p className={styles.roleIndicator}>
                                {authMode === 'sign-up' ? 'Joining' : 'Signing in'} as <strong>{selectedRole === 'farmer' ? 'Farmer' : 'Service Provider'}</strong>
                            </p>
                        )}

                        <div className={styles.toggleAuth}>
                            {authMode === 'sign-up' ? (
                                <p>Already have an account? <span onClick={() => { setAuthMode('sign-in'); window.history.pushState({}, '', '/auth?mode=sign-in'); }}>Log in</span></p>
                            ) : (
                                <p>New to AgroW? <span onClick={() => { setAuthMode('sign-up'); window.history.pushState({}, '', '/auth?mode=sign-up'); }}>Sign up</span></p>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AuthPage;
