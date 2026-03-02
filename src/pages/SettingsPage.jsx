import React, { useState } from 'react';
import styles from './SettingsPage.module.css';
import { User, Bell, Lock, Eye, Monitor, LogOut } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        try {
            localStorage.clear();
            await signOut();
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.settingsHeader}>
                <h1>Settings</h1>
            </div>

            <div className={styles.settingsLayout}>
                {/* Sidebar Navigation for Settings */}
                <div className={styles.settingsSidebar}>
                    <button className={`${styles.tabBtn} ${styles.activeTab}`}>
                        <User size={18} /> Account
                    </button>
                    <button className={styles.tabBtn}>
                        <Monitor size={18} /> Profile
                    </button>
                    <button className={styles.tabBtn}>
                        <Lock size={18} /> Safety & Privacy
                    </button>
                    <button className={styles.tabBtn}>
                        <Eye size={18} /> Feed Settings
                    </button>
                    <button className={styles.tabBtn}>
                        <Bell size={18} /> Notifications
                    </button>
                </div>

                {/* Main Settings Content */}
                <div className={styles.settingsContent}>
                    <section className={styles.settingsSection}>
                        <h2>Account Settings</h2>
                        <span className={styles.sectionDesc}>Manage your account preferences</span>

                        <div className={styles.settingItem}>
                            <div>
                                <h3>Email Address</h3>
                                <p>{user?.primaryEmailAddress?.emailAddress || 'Not available'}</p>
                            </div>
                            <button className={styles.actionBtn}>Change</button>
                        </div>

                        <div className={styles.settingItem}>
                            <div>
                                <h3>Change Password</h3>
                                <p>Password must be at least 8 characters long</p>
                            </div>
                            <button className={styles.actionBtn}>Change</button>
                        </div>

                        <div className={styles.settingItem}>
                            <div>
                                <h3 className={styles.dangerText}>Delete Account</h3>
                                <p>Permanently delete your account and all your content</p>
                            </div>
                            <button className={`${styles.actionBtn} ${styles.dangerBtn}`}>Delete</button>
                        </div>
                    </section>

                    {/* Logout Section */}
                    <section className={styles.settingsSection} style={{ marginTop: '2rem' }}>
                        <h2>Session</h2>
                        <span className={styles.sectionDesc}>Manage your current session</span>

                        <div className={styles.settingItem}>
                            <div>
                                <h3 className={styles.dangerText}>Log Out</h3>
                                <p>Sign out of your AgroW account on this device</p>
                            </div>
                            <button
                                className={`${styles.actionBtn} ${styles.logoutBtn}`}
                                onClick={() => setShowLogoutConfirm(true)}
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className={styles.modalOverlay} onClick={() => setShowLogoutConfirm(false)}>
                    <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
                        <h3>Are you sure you want to log out?</h3>
                        <p>You will need to sign in again to access your account.</p>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmLogoutBtn}
                                onClick={handleLogout}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;

