import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Compass, Loader2, Search } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import styles from './CommunitiesListPage.module.css';

const CommunitiesListPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [communities, setCommunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    // userId from Clerk or custom username
    const userId = localStorage.getItem('customUserId') || user?.username || user?.id || 'guest';
    const role = localStorage.getItem('userRole') || 'farmer';

    const fetchCommunities = async () => {
        setIsLoading(true);
        try {
            const response = await api.getAllCommunities();
            const data = response.data || response;
            if (Array.isArray(data)) {
                setCommunities(data);
            } else {
                setCommunities([]);
            }
        } catch (error) {
            console.error("Failed to fetch communities", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        const handleSearch = async () => {
            if (!searchTerm.trim()) {
                fetchCommunities();
                return;
            }
            setIsSearching(true);
            try {
                const response = await api.searchCommunities(searchTerm);
                const data = response.data || response;
                if (Array.isArray(data)) {
                    setCommunities(data);
                } else if (data) {
                    setCommunities([data]);
                } else {
                    setCommunities([]);
                }
            } catch (error) {
                console.error("Search failed", error);
                setCommunities([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            handleSearch();
        }, 500); // debounce

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleJoinClick = async (e, communityId, isMember) => {
        e.preventDefault(); // prevent navigation
        e.stopPropagation();

        if (isMember) {
            navigate(`/c/${communityId}`);
            return;
        }

        try {
            await api.addMemberToCommunity(communityId, role, userId);
            window.dispatchEvent(new Event('communityMembershipChanged'));
            // Optimistically update membership locally
            setCommunities(prev => prev.map(c => {
                if ((c.communityId || c._id) === communityId) {
                    return {
                        ...c,
                        membersId: [...(c.membersId || []), userId]
                    };
                }
                return c;
            }));
        } catch (error) {
            console.error("Failed to join community", error);
            alert("Could not join community.");
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 size={48} color="#2E7D32" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Explore Communities</h1>
                <p>Find and join communities tailored to your farming interests.</p>

                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)', maxWidth: '500px', margin: '1.5rem auto 0' }}>
                    <Search size={20} color="var(--color-text-secondary)" style={{ marginRight: '0.75rem' }} />
                    <input
                        type="text"
                        placeholder="Search topics, regions, tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: 'var(--color-text-primary)' }}
                    />
                    {isSearching && <Loader2 size={18} className={styles.spin} style={{ marginLeft: 'auto', color: 'var(--color-primary)' }} />}
                </div>
            </div>

            <div className={styles.grid}>
                {communities.length > 0 ? communities.map(c => {
                    const cId = c.communityId || c._id;
                    const isMember = c.membersId?.includes(userId);
                    return (
                        <Link to={`/c/${cId}`} key={cId} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}><Users size={24} /></div>
                                <div className={styles.cardTitle}>
                                    <h3>{c.communityName}</h3>
                                    <span>{c.membersId?.length || 0} Members</span>
                                </div>
                            </div>
                            <p className={styles.cardDesc}>
                                {Array.isArray(c.communitySearchTagList)
                                    ? c.communitySearchTagList.flat().join(', ')
                                    : c.communitySearchTagList || 'Community for dynamic farming topics'}
                            </p>
                            <button
                                className={styles.joinBtn}
                                onClick={(e) => handleJoinClick(e, cId, isMember)}
                                style={{
                                    background: isMember ? 'transparent' : 'var(--color-primary)',
                                    color: isMember ? 'var(--color-primary)' : 'white',
                                    border: isMember ? '1px solid var(--color-primary)' : 'none'
                                }}
                            >
                                {isMember ? 'Visit' : 'Join'}
                            </button>
                        </Link>
                    )
                }) : (
                    <p style={{ color: 'var(--color-text-secondary)' }}>No communities found. Be the first to create one!</p>
                )}
            </div>
        </div>
    );
};

export default CommunitiesListPage;
