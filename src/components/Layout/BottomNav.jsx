import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Plus, Compass, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const navItems = [
    { label: 'Home', icon: Home, path: '/feed' },
    { label: 'Services', icon: Briefcase, path: '/services' },
    { label: 'Create', icon: Plus, path: '/submit', isCenter: true },
    { label: 'Explore', icon: Compass, path: '/c/communities' },
    { label: 'Profile', icon: User, path: '/profile' },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className={styles.bottomNav}>
            {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                    (item.path === '/feed' && location.pathname.startsWith('/c/') && !location.pathname.includes('/communities'));
                const Icon = item.icon;

                if (item.isCenter) {
                    return (
                        <button
                            key={item.label}
                            className={styles.centerBtn}
                            onClick={() => navigate(item.path)}
                            aria-label={item.label}
                        >
                            <div className={styles.centerBtnCircle}>
                                <Icon size={24} strokeWidth={2.5} />
                            </div>
                            <span className={styles.navLabel} style={{ color: '#43A047', marginTop: '2px' }}>Create</span>
                        </button>
                    );
                }

                return (
                    <button
                        key={item.label}
                        className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        onClick={() => navigate(item.path)}
                        aria-label={item.label}
                    >
                        <Icon size={22} />
                        <span className={styles.navLabel}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
