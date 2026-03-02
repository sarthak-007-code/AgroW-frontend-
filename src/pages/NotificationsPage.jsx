import React from 'react';
import styles from './NotificationsPage.module.css';
import { Mail, Shield, UserPlus, Image as ImgIcon, MessageSquare, Settings } from 'lucide-react';

const NotificationsPage = () => {
    return (
        <div className={styles.notificationsContainer}>
            <div className={styles.header}>
                <h1>Notifications</h1>
                <div className={styles.headerActions}>
                    <button className={styles.actionBtn}>Mark all as read</button>
                    <button className={styles.iconBtn}><Settings size={18} /></button>
                </div>
            </div>

            <div className={styles.notificationsList}>
                {/* Notification Item 1 */}
                <div className={`${styles.notifItem} ${styles.unread}`}>
                    <div className={styles.notifIconWrapper} style={{ backgroundColor: '#FF4500' }}>
                        <Shield size={20} color="white" />
                    </div>
                    <div className={styles.notifContent}>
                        <div className={styles.notifTitle}>
                            <strong>AgroW Welcome</strong> - Getting Started with AgroW
                        </div>
                        <div className={styles.notifDesc}>
                            Welcome to the community! Whether you are a farmer looking for insights or a provider...
                        </div>
                        <div className={styles.notifTime}>14m ago</div>
                    </div>
                </div>

                {/* Notification Item 2 */}
                <div className={styles.notifItem}>
                    <div className={styles.notifIconWrapper} style={{ backgroundColor: '#2E7D32' }}>
                        <MessageSquare size={20} color="white" />
                    </div>
                    <div className={styles.notifContent}>
                        <div className={styles.notifTitle}>
                            Trending in <strong>r/organic-farming</strong>
                        </div>
                        <div className={styles.notifDesc}>
                            Best practices for organic wheat cultivation? New discussion started.
                        </div>
                        <div className={styles.notifTime}>6h ago</div>
                    </div>
                    <div className={styles.notifThumbnail}>
                        <ImgIcon size={24} color="#9CA3AF" />
                    </div>
                </div>

                {/* Notification Item 3 */}
                <div className={styles.notifItem}>
                    <div className={styles.notifIconWrapper} style={{ backgroundColor: '#3B82F6' }}>
                        <UserPlus size={20} color="white" />
                    </div>
                    <div className={styles.notifContent}>
                        <div className={styles.notifTitle}>
                            <strong>Ramesh Patil</strong> started following you
                        </div>
                        <div className={styles.notifDesc}>
                            Check out their profile to see their latest activities.
                        </div>
                        <div className={styles.notifTime}>1d ago</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
