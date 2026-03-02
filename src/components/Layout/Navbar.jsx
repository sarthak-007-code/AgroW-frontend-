import React from 'react';
import { Leaf, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'mr', name: 'मराठी' },
];

const Navbar = () => {
    const { language, switchLanguage, t } = useLanguage();

    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer} `}>
                <div className={styles.logo}>
                    <Leaf className={styles.logoIcon} size={28} />
                    <span className={styles.logoText}>{t.navbar.siteName}</span>
                </div>

                <div className={styles.navActions} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className={styles.langWrapper}>
                        <Globe size={20} className={styles.langIcon} />
                        <select
                            className={styles.langSelect}
                            value={language}
                            onChange={(e) => switchLanguage(e.target.value)}
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Link to="/auth?mode=sign-in" style={{
                        padding: '8px 16px',
                        backgroundColor: '#2E7D32',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600'
                    }}>Login</Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
