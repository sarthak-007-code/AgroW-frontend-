import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const { user: clerkUser, isLoaded } = useUser();

    const [userData, setUserData] = useState(null);
    const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'farmer');
    const [myCommunities, setMyCommunities] = useState([]);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserData = useCallback(async (email, role) => {
        setIsLoadingUser(true);
        setError(null);
        try {
            let profileData;
            if (role === 'provider' || role === 'service_provider') {
                profileData = await api.getServiceProvider(email);
            } else {
                profileData = await api.getFarmer(email);
            }

            const profile = profileData?.data || profileData;
            setUserData(profile);

            // Fetch user's joined communities
            const userId = profile?.userId || profile?._id || localStorage.getItem('customUserId') || clerkUser?.username || clerkUser?.id;
            if (userId) {
                try {
                    const commRes = await api.getUserCommunities(userId, role);
                    const commData = commRes?.data || commRes;
                    setMyCommunities(Array.isArray(commData) ? commData : []);
                } catch (commErr) {
                    console.error("Error fetching user communities:", commErr);
                    setMyCommunities([]);
                }
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            setError(err.message);
            setUserData(null);
            setMyCommunities([]);
        } finally {
            setIsLoadingUser(false);
        }
    }, [clerkUser]);

    // Initialize on Clerk auth
    useEffect(() => {
        if (!isLoaded || !clerkUser) {
            setIsLoadingUser(false);
            return;
        }

        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        const role = localStorage.getItem('userRole') || 'farmer';
        setUserRole(role);

        if (email) {
            fetchUserData(email, role);
        } else {
            setIsLoadingUser(false);
        }
    }, [isLoaded, clerkUser, fetchUserData]);

    const refreshUserCommunities = useCallback(async () => {
        if (!userData) return;
        const userId = userData?.userId || userData?._id || localStorage.getItem('customUserId') || clerkUser?.username || clerkUser?.id;
        const role = localStorage.getItem('userRole') || 'farmer';
        if (!userId) return;
        try {
            const commRes = await api.getUserCommunities(userId, role);
            const commData = commRes?.data || commRes;
            setMyCommunities(Array.isArray(commData) ? commData : []);
        } catch (err) {
            console.error("Error refreshing communities:", err);
        }
    }, [userData, clerkUser]);

    const refreshUserData = useCallback(async () => {
        if (!clerkUser) return;
        const email = clerkUser.emailAddresses?.[0]?.emailAddress;
        const role = localStorage.getItem('userRole') || 'farmer';
        if (email) {
            await fetchUserData(email, role);
        }
    }, [clerkUser, fetchUserData]);

    const value = {
        userData,
        userRole,
        myCommunities,
        isLoadingUser,
        error,
        fetchUserData,
        refreshUserData,
        refreshUserCommunities
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within UserProvider');
    }
    return context;
};
