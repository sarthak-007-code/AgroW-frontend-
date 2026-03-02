import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Plus, Menu, ChevronDown, User, Sun, Moon, Settings, LogOut, Loader2, Languages } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import styles from './TopBar.module.css';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

const TopBar = ({ toggleSidebar }) => {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const { t, switchLanguage } = useLanguage();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    });
    const profileRef = useRef(null);
    const searchRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleSearch = async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const response = await api.searchCommunities(searchTerm);
                const data = response.data || response;
                if (Array.isArray(data)) {
                    setSearchResults(data);
                } else if (data && Object.keys(data).length > 0) {
                    setSearchResults([data]);
                } else {
                    setSearchResults([]);
                }
            } catch (error) {
                console.error("Search failed", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            handleSearch();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const handleSearchClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };

        document.addEventListener('mousedown', handleSearchClickOutside);
        return () => document.removeEventListener('mousedown', handleSearchClickOutside);
    }, []);

    const [selectedLang, setSelectedLang] = useState('en');

    const INDIAN_LANGUAGES = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिन्दी' },
        { code: 'mr', label: 'मराठी' },
        { code: 'bn', label: 'বাংলা' },
        { code: 'ta', label: 'தமிழ்' },
        { code: 'te', label: 'తెలుగు' },
        { code: 'gu', label: 'ગુજરાતી' },
        { code: 'kn', label: 'ಕನ್ನಡ' },
        { code: 'ml', label: 'മലയാളം' },
        { code: 'pa', label: 'ਪੰਜਾਬੀ' },
        { code: 'or', label: 'ଓଡ଼ିଆ' },
        { code: 'ur', label: 'اردو' },
    ];

    // Google Translate initialization — load script dynamically after mount
    useEffect(() => {
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'hi,mr,bn,ta,te,gu,kn,ml,pa,or,ur',
                autoDisplay: false
            }, 'google_translate_element');
        };

        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.type = 'text/javascript';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(script);
        }
    }, []);

    const handleLanguageChange = (langCode) => {
        setSelectedLang(langCode);
        if (langCode === 'en') {
            // Reset to original language
            const iframe = document.querySelector('.goog-te-banner-frame');
            if (iframe) {
                const restoreBtn = iframe.contentDocument?.querySelector('.goog-close-link');
                if (restoreBtn) { restoreBtn.click(); return; }
            }
            // Fallback: clear the cookie and reload
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
            window.location.reload();
            return;
        }
        // Trigger translation via the hidden Google Translate combo
        const combo = document.querySelector('.goog-te-combo');
        if (combo) {
            combo.value = langCode;
            combo.dispatchEvent(new Event('change'));
        }
    };

    return (
        <header className={styles.topBar}>
            <div className={styles.logoArea}>
                <button className={styles.iconBtn} onClick={toggleSidebar} style={{ marginRight: '0.5rem' }}>
                    <Menu size={20} />
                </button>
                <span onClick={() => navigate('/feed')} className={styles.logoText}>AgroW</span>
            </div>

            <div className={styles.searchContainer} ref={searchRef}>
                <Search size={18} className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder={t.app?.searchPlaceholder || "Search communities..."}
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                />
                {isSearching && <Loader2 size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />}

                {isSearchFocused && searchTerm.trim() && searchResults.length > 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', zIndex: 100, maxHeight: '300px', overflowY: 'auto' }}>
                        {searchResults.map(c => (
                            <div
                                key={c.communityId || c._id}
                                style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', cursor: 'pointer', borderBottom: '1px solid var(--color-border)' }}
                                onClick={() => {
                                    setIsSearchFocused(false);
                                    setSearchTerm('');
                                    navigate(`/c/${c.communityId || c._id}`);
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{c.communityName}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {Array.isArray(c.communitySearchTagList) ? c.communitySearchTagList.flat().join(', ') : c.communitySearchTagList}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {isSearchFocused && searchTerm.trim() && !isSearching && searchResults.length === 0 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)', zIndex: 100 }}>
                        No communities found.
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <button className={styles.createPostBtn} onClick={() => navigate('/create')}>
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Create Post</span>
                </button>
                <button className={styles.iconBtn} onClick={toggleDarkMode} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className={styles.translateWrapper}>
                    <Languages size={18} className={styles.translateIcon} />
                    <select
                        className={styles.langSelect}
                        value={selectedLang}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                        {INDIAN_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.label}</option>
                        ))}
                    </select>
                </div>
                {/* Hidden Google Translate widget — drives the actual translation */}
                <div id="google_translate_element" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}></div>
                <button className={styles.iconBtn} onClick={() => navigate('/notifications')} title="Notifications">
                    <Bell size={20} />
                </button>

                <div className={styles.profileContainer} ref={profileRef}>
                    <button
                        className={styles.profileBtn}
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        {isLoaded && user ? (
                            <img src={user.imageUrl} alt="Profile" className={styles.avatar} />
                        ) : (
                            <div className={styles.avatar}><User size={16} /></div>
                        )}
                        <span className={styles.username}>
                            {isLoaded && user ? user.firstName || 'User' : 'Guest'}
                        </span>
                        <ChevronDown size={14} color="#6B7280" />
                    </button>

                    {isProfileOpen && (
                        <div className={styles.dropdownMenu}>
                            <button className={styles.dropdownItem} onClick={() => { setIsProfileOpen(false); navigate('/profile'); }}>
                                <User size={18} /> {t.app?.viewProfile || 'View Profile'}
                            </button>
                            <button className={styles.dropdownItem} onClick={() => {
                                toggleDarkMode();
                                // keep open to let them see switch
                            }}>
                                <Moon size={18} /> {isDarkMode ? (t.app?.lightMode || 'Light Mode') : (t.app?.darkMode || 'Dark Mode')}
                            </button>
                            <button className={styles.dropdownItem} onClick={() => { setIsProfileOpen(false); navigate('/settings'); }}>
                                <Settings size={18} /> {t.app?.settings || 'Settings'}
                            </button>

                            <div className={styles.dropdownDivider}></div>
                            {isLoaded && user ? (
                                <button className={styles.dropdownItem} onClick={() => signOut()}>
                                    <LogOut size={18} /> {t.app?.logOut || 'Log Out'}
                                </button>
                            ) : (
                                <button className={styles.dropdownItem} onClick={() => { setIsProfileOpen(false); navigate('/auth'); }}>
                                    <LogOut size={18} /> {t.app?.logIn || 'Log In'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
