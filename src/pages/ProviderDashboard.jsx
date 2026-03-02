import React, { useState } from 'react';
import { Plus, Tractor, DollarSign, Briefcase, MapPin, Calendar, CheckCircle } from 'lucide-react';
import styles from './ProviderDashboard.module.css';

const ProviderDashboard = () => {
    const [activeTab, setActiveTab] = useState('services');

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h1>Provider Dashboard</h1>
                <button className={styles.addServiceBtn}>
                    <Plus size={20} /> Add New Service
                </button>
            </div>

            {/* Stats Overview */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#E8F5E9', color: '#2E7D32' }}>
                        <Briefcase />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>24</h3>
                        <p>Total Jobs</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#FFF3E0', color: '#F57C00' }}>
                        <CheckCircle />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>18</h3>
                        <p>Completed Jobs</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#FCE4EC', color: '#C2185B' }}>
                        <Briefcase />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>4</h3>
                        <p>Remaining Jobs</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: '#E3F2FD', color: '#1565C0' }}>
                        <Tractor />
                    </div>
                    <div className={styles.statInfo}>
                        <h3>2</h3>
                        <p>Currently Working</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'services' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('services')}
                >
                    My Services
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    New Requests <span style={{ background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '4px' }}>2</span>
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'services' ? (
                <div className={styles.serviceList}>
                    {/* Service Card 1 */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceHeader}>
                            <div>
                                <div className={styles.serviceTitle}>John Deere 5310 Tractor</div>
                                <div className={styles.servicePrice}>₹800 / hour</div>
                            </div>
                            <span className={`${styles.serviceStatus} ${styles.statusActive}`}>Active</span>
                        </div>
                        <div className={styles.serviceBody}>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                55HP Tractor with Rotavator and Plough. Available for active booking.
                            </p>
                            <div className={styles.serviceActions}>
                                <button className={styles.actionBtn}>Edit</button>
                                <button className={styles.actionBtn}>Pause</button>
                            </div>
                        </div>
                    </div>

                    {/* Service Card 2 */}
                    <div className={styles.serviceCard}>
                        <div className={styles.serviceHeader}>
                            <div>
                                <div className={styles.serviceTitle}>Drone Spraying Service</div>
                                <div className={styles.servicePrice}>₹400 / acre</div>
                            </div>
                            <span className={`${styles.serviceStatus} ${styles.statusActive}`}>Active</span>
                        </div>
                        <div className={styles.serviceBody}>
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Precision spraying for all crops. 10L capacity drone.
                            </p>
                            <div className={styles.serviceActions}>
                                <button className={styles.actionBtn}>Edit</button>
                                <button className={styles.actionBtn}>Pause</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.requestsList}>
                    {/* Request 1 */}
                    <div className={styles.requestCard}>
                        <div className={styles.reqInfo}>
                            <h4>Raju Patil</h4>
                            <div className={styles.reqMeta}>
                                <span><Tractor size={16} style={{ verticalAlign: 'text-bottom' }} /> Tractor Rental</span>
                                <span><MapPin size={16} style={{ verticalAlign: 'text-bottom' }} /> Niphad, Nashik</span>
                                <span><Calendar size={16} style={{ verticalAlign: 'text-bottom' }} /> Tomorrow</span>
                            </div>
                        </div>
                        <div className={styles.reqActions}>
                            <button className={styles.acceptBtn}>Accept</button>
                            <button className={styles.declineBtn}>Decline</button>
                        </div>
                    </div>

                    {/* Request 2 */}
                    <div className={styles.requestCard}>
                        <div className={styles.reqInfo}>
                            <h4>Suresh Bhau</h4>
                            <div className={styles.reqMeta}>
                                <span><Tractor size={16} style={{ verticalAlign: 'text-bottom' }} /> Drone Spraying</span>
                                <span><MapPin size={16} style={{ verticalAlign: 'text-bottom' }} /> Sinnar, Nashik</span>
                                <span><Calendar size={16} style={{ verticalAlign: 'text-bottom' }} /> 22 Feb</span>
                            </div>
                        </div>
                        <div className={styles.reqActions}>
                            <button className={styles.acceptBtn}>Accept</button>
                            <button className={styles.declineBtn}>Decline</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderDashboard;
