import React, { useState, useEffect } from 'react';
import styles from './ProfilePage.module.css';
import { User, Share, Plus, Settings, Eye, MapPin, Tag, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import { useUserContext } from '../context/UserContext';

const ProfilePage = () => {
    const { user, isLoaded } = useUser();
    const { userData: contextUserData, isLoadingUser } = useUserContext();
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const userId = localStorage.getItem('customUserId') || user?.username || user?.id;
    const role = localStorage.getItem('userRole') || 'farmer';

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) {
                setIsLoadingProfile(false);
                return;
            }
            try {
                setIsLoadingProfile(true);
                let res;
                if (role === 'service_provider') {
                    res = await api.getServiceProvider(userId);
                } else {
                    res = await api.getFarmer(userId);
                }
                if (res && res.data) {
                    setUserData(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch user profile", error);
            } finally {
                setIsLoadingProfile(false);
            }
        };

        if (isLoaded) {
            fetchProfile();
        }
    }, [userId, role, isLoaded]);

    const handleShareProfile = async () => {
        const urlToShare = `${window.location.origin}/u/${userId}`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `Check out ${userData ? userData.firstName : (user?.firstName || 'this')} on AgroW`,
                    url: urlToShare
                });
            } else {
                await navigator.clipboard.writeText(urlToShare);
                alert('Profile link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const tabs = ['Overview', 'Posts', 'Comments', 'Saved', 'History', 'Upvoted', 'Downvoted'];

    return (
        <div className={styles.profilePage}>
            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.userInfo}>
                    {isLoaded && user ? (
                        <img src={user.imageUrl} alt="Avatar" className={styles.avatar} />
                    ) : (
                        <div className={styles.avatarPlaceholder}><User size={40} /></div>
                    )}
                    <div className={styles.nameContainer}>
                        {isLoadingProfile ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h1>Loading...</h1>
                                <Loader2 size={24} className={styles.spin} style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            <>
                                <h1>{userData ? `${userData.firstName} ${userData.lastName}` : (contextUserData ? `${contextUserData.firstName} ${contextUserData.lastName}` : (isLoaded && user ? user.firstName || 'User' : 'Guest'))}</h1>
                                <span>{isLoaded && user ? user.username || userData?.userId || contextUserData?.userId || userId : 'guest_user'}</span>
                                {userData && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                                        <MapPin size={14} /> {userData.village}, {userData.district}, {userData.state}
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <span style={{ background: 'var(--color-primary-light)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                                        {role.replace('_', ' ')}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab.toLowerCase() ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Layout Grid */}
            <div className={styles.contentGrid}>
                {/* Main Content Area */}
                <div className={styles.mainContent}>
                    <div className={styles.contentFilter}>
                        <div className={styles.filterLeft}>
                            <button className={styles.newPostBtn}>
                                <Plus size={16} /> Create Post
                            </button>
                        </div>
                    </div>

                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <User size={64} color="#9CA3AF" />
                        </div>
                        <h2>You don't have any {activeTab} yet</h2>
                        <p>Once you contribute to communities, it'll show up here.</p>
                        <button className={styles.actionBtn}>Update Settings</button>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className={styles.sidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.cardContent}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 className={styles.cardName} style={{ margin: 0 }}>{userData ? userData.firstName : (contextUserData ? contextUserData.firstName : (isLoaded && user ? user.firstName : 'Guest'))}</h2>
                                <button className={styles.shareBtn} style={{ marginBottom: 0 }} onClick={handleShareProfile}><Share size={14} /> Share</button>
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={styles.statCol}>
                                    <span className={styles.statLabel}>Contributions</span>
                                    <span className={styles.statValue}>5</span>
                                </div>
                                <div className={styles.statCol}>
                                    <span className={styles.statLabel}>AgroW Age</span>
                                    <span className={styles.statValue}>1 y</span>
                                </div>
                            </div>

                            {userData && (
                                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                    {userData.cropList && userData.cropList.length > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={14} /> Crops Grown
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {userData.cropList.map((crop, idx) => (
                                                    <span key={idx} style={{ background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{crop}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {userData.serviceList && userData.serviceList.length > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={14} /> Services Provided
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {userData.serviceList.map((service, idx) => (
                                                    <span key={idx} style={{ background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{service}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {userData.interestedList && userData.interestedList.length > 0 && (
                                        <div style={{ marginBottom: '1rem' }}>
                                            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Tag size={14} /> Interests
                                            </h4>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {userData.interestedList.map((interest, idx) => (
                                                    <span key={idx} style={{ background: 'var(--color-surface-hover)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--color-text-primary)' }}>{interest}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.settingsSection}>
                            <h3>SETTINGS</h3>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <div className={styles.settingIcon}><User size={16} /></div>
                                    <div>
                                        <h4>Profile</h4>
                                        <p>Customize your profile</p>
                                    </div>
                                </div>
                                <button className={styles.updateBtn}>Update</button>
                            </div>

                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <div className={styles.settingIcon}><Eye size={16} /></div>
                                    <div>
                                        <h4>Curate your profile</h4>
                                        <p>Manage what people see when they visit</p>
                                    </div>
                                </div>
                                <button className={styles.updateBtn}>Update</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
