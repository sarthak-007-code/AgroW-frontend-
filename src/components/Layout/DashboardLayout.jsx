import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../../services/api';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
    // Default open on desktop, closed on mobile
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const { user, isLoaded } = useUser();

    useEffect(() => {
        const fetchUserData = async () => {
            if (isLoaded && user) {
                const email = user.primaryEmailAddress?.emailAddress;
                if (!email) return;

                let role = localStorage.getItem('userRole');
                let retryOther = !role; // If no role, we will try both

                try {
                    if (role === 'farmer' || retryOther) {
                        try {
                            const res = await api.getFarmer(email);
                            const farmerData = res.data || res;
                            if (farmerData) {
                                localStorage.setItem('userRole', 'farmer');
                                localStorage.setItem('customUserId', farmerData.userId || farmerData._id);
                                return; // Success, stop trying
                            }
                        } catch (err) {
                            if (!retryOther) throw err; // Only throw if we shouldn't retry
                        }
                    }

                    if (role === 'provider' || retryOther) {
                        const res = await api.getServiceProvider(email);
                        const providerData = res.data || res;
                        if (providerData) {
                            localStorage.setItem('userRole', 'provider');
                            localStorage.setItem('customUserId', providerData.userId || providerData._id);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch user data after login", error);
                }
            }
        };

        fetchUserData();
    }, [user, isLoaded]);

    return (
        <div className={styles.layout}>
            <TopBar toggleSidebar={toggleSidebar} />

            <div className={styles.mainWrapper}>
                {sidebarOpen && window.innerWidth <= 1024 && (
                    <div
                        className={styles.mobileOverlay}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <Sidebar isOpen={sidebarOpen} closeSidebar={() => {
                    if (window.innerWidth <= 1024) setSidebarOpen(false);
                }} />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    );
};

export default DashboardLayout;
