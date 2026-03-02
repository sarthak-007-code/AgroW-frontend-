import React, { useState, useEffect } from 'react';
import { Home, Compass, Users, Tractor, Settings, Plus, Star, BookOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../services/api';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { t } = useLanguage();
    const { user } = useUser();
    const [myCommunities, setMyCommunities] = useState([]);
    const role = localStorage.getItem('userRole') || 'farmer';

    useEffect(() => {
        const fetchUserCommunities = async () => {
            if (!user) return;
            try {
                const userId = localStorage.getItem('customUserId') || user?.username || user?.id;
                const res = await api.getUserCommunities(userId, role);
                const data = res.data || res;
                if (Array.isArray(data)) {
                    setMyCommunities(data);
                } else if (data && typeof data === 'object') {
                    setMyCommunities(Object.keys(data).length > 0 ? [data] : []);
                } else {
                    setMyCommunities([]);
                }
            } catch (error) {
                console.error("Error fetching user communities in sidebar:", error);
            }
        };

        // Initial fetch
        fetchUserCommunities();

        // Listen for membership changes
        window.addEventListener('communityMembershipChanged', fetchUserCommunities);
        return () => window.removeEventListener('communityMembershipChanged', fetchUserCommunities);
    }, [user]);

    return (
        <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>

            {/* Main Feeds */}
            <div className={styles.section}>
                <NavLink to="/feed" onClick={closeSidebar} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeItem : ''}`}>
                    <Home size={20} className={styles.icon} />
                    <span>{t.app?.home || 'Home'}</span>
                </NavLink>
                {role === 'provider' ? (
                    <NavLink to="/provider-dashboard" onClick={closeSidebar} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeItem : ''}`}>
                        <Tractor size={20} className={styles.icon} />
                        <span>Get Needy Farmers</span>
                    </NavLink>
                ) : (
                    <NavLink to="/services" onClick={closeSidebar} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeItem : ''}`}>
                        <Tractor size={20} className={styles.icon} />
                        <span>{t.app?.findServices || 'Find Services'}</span>
                    </NavLink>
                )}

                <NavLink to="/schemes" onClick={closeSidebar} className={({ isActive }) => `${styles.navItem} ${isActive ? styles.activeItem : ''}`}>
                    <BookOpen size={20} className={styles.icon} />
                    <span>Government Schemes</span>
                </NavLink>
            </div>

            {/* Communities */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.app?.communities || 'Communities'}</h3>

                <div style={{ maxHeight: '240px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                    {myCommunities.map((c, idx) => {
                        const colors = ['#81C784', '#FFB74D', '#64B5F6', '#BA68C8', '#4DB6AC'];
                        return (
                            <NavLink key={c.communityId || c._id} to={`/c/${c.communityId || c._id}`} onClick={closeSidebar} className={styles.navItem}>
                                <div className={styles.communityImg} style={{ background: colors[idx % colors.length], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>
                                    {c.communityName ? c.communityName[0].toUpperCase() : 'C'}
                                </div>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.communityName}</span>
                            </NavLink>
                        );
                    })}
                </div>

                <NavLink to="/c/communities" onClick={closeSidebar} className={styles.navItem}>
                    <Compass size={20} className={styles.icon} />
                    <span>{t.app?.exploreAll || 'Explore All'}</span>
                </NavLink>

                <NavLink to="/create-community" onClick={closeSidebar} className={styles.navItem} style={{ textDecoration: 'none' }}>
                    <button className={styles.createComBtn}>
                        <Plus size={16} /> {t.app?.createCommunity || 'Create Community'}
                    </button>
                </NavLink>
            </div>

            {/* Resources */}
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.app?.resources || 'Resources'}</h3>
                <NavLink to="/saved" onClick={closeSidebar} className={styles.navItem}>
                    <Star size={20} className={styles.icon} />
                    <span>{t.app?.savedPosts || 'Saved Posts'}</span>
                </NavLink>
                <NavLink to="/settings" onClick={closeSidebar} className={styles.navItem}>
                    <Settings size={20} className={styles.icon} />
                    <span>{t.app?.settings || 'Settings'}</span>
                </NavLink>
            </div>

        </aside>
    );
};

export default Sidebar;
