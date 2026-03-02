import React, { useState, useEffect } from 'react';
import {
    Image, Mic, Tag, Smile, Send,
    ThumbsUp, MessageSquare, Share2, MoreHorizontal,
    TrendingUp, Star, Clock, BookOpen, AlertCircle, Newspaper,
    Users, Plus, Trash2, X, Leaf, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import { useUserContext } from '../context/UserContext';
import toast from 'react-hot-toast';
import styles from './FeedPage.module.css';

const FeedPage = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { myCommunities, isLoadingUser, refreshUserCommunities } = useUserContext();
    const [activeFilter, setActiveFilter] = useState('trending');
    const [posts, setPosts] = useState([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [newsArticles, setNewsArticles] = useState([]);
    const [isLoadingNews, setIsLoadingNews] = useState(false);
    const [fetchedComments, setFetchedComments] = useState({});
    const [isFetchingComments, setIsFetchingComments] = useState(false);
    const [shareModalPost, setShareModalPost] = useState(null);
    const [isSharing, setIsSharing] = useState(false);

    const currentUserId = localStorage.getItem('customUserId') || user?.username || user?.id;

    const handleDelete = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.deleteContent(postId);
            setPosts(posts => posts.filter(p => p._id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post.");
        }
    };

    const handleLike = async (postId) => {
        try {
            await api.likeContent(postId, currentUserId);
            setPosts(posts => posts.map(p => {
                if (p._id === postId) {
                    const hasLiked = p.likes?.includes(currentUserId);
                    return {
                        ...p,
                        likes: hasLiked ? p.likes.filter(id => id !== currentUserId) : [...(p.likes || []), currentUserId]
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error("Failed to like post", error);
        }
    };

    const handleComment = async (post) => {
        const postId = post._id;
        const communityId = post.communityId || '';
        if (!commentText.trim()) return;
        try {
            const commentUser = user?.username || user?.firstName || currentUserId;
            await api.commentContent(communityId, postId, commentUser, commentText);

            const newComment = { _id: Date.now().toString(), creatorId: commentUser, commentText, createdAt: new Date().toISOString() };

            setFetchedComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), newComment]
            }));
            setPosts(posts => posts.map(p => {
                if (p._id === postId) {
                    return {
                        ...p,
                        comments: [...(p.comments || []), newComment]
                    };
                }
                return p;
            }));
            setCommentText('');
        } catch (error) {
            console.error("Failed to add comment", error);
            alert("Failed to add comment.");
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.deleteComment(commentId);
            setFetchedComments(prev => ({
                ...prev,
                [postId]: prev[postId].filter(c => c._id !== commentId)
            }));
            setPosts(posts => posts.map(p => {
                if (p._id === postId) {
                    return { ...p, comments: (p.comments || []).filter(c => c._id !== commentId) };
                }
                return p;
            }));
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const toggleComments = async (postId) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
            return;
        }
        setActiveCommentPostId(postId);
        if (!fetchedComments[postId]) {
            setIsFetchingComments(true);
            try {
                const res = await api.getContentComments(postId);
                const data = res.data || res;
                console.log("FETCHED COMMENTS RESPONSE:", data);
                const comments = data.comments || (Array.isArray(data) ? data : []);
                setFetchedComments(prev => ({ ...prev, [postId]: comments }));
            } catch (error) {
                console.error("Failed to load comments", error);
                setFetchedComments(prev => ({ ...prev, [postId]: [] }));
            } finally {
                setIsFetchingComments(false);
            }
        }
    };

    const handleSharePost = (post) => {
        setShareModalPost(post);
    };

    const handleShareToCommunity = async (targetCommunityId, targetCommunityName) => {
        if (!shareModalPost) return;
        setIsSharing(true);
        try {
            const payload = {
                communityId: targetCommunityId,
                creatorId: currentUserId,
                title: `[Shared] ${shareModalPost.title || ''}`.trim(),
                description: shareModalPost.description || shareModalPost.text || '',
                tags: shareModalPost.tags || [],
                media: shareModalPost.media || []
            };
            await api.createContent(payload);
            toast.success(`Shared to ${targetCommunityName}!`);
            setShareModalPost(null);
        } catch (error) {
            console.error('Error sharing to community:', error);
            toast.error('Failed to share post.');
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopyLink = async (postId) => {
        const urlToShare = `${window.location.origin}/post/${postId}`;
        try {
            await navigator.clipboard.writeText(urlToShare);
            toast.success('Link copied to clipboard!');
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    useEffect(() => {
        const fetchFeedPosts = async () => {
            if (!myCommunities || myCommunities.length === 0) {
                setPosts([]);
                return;
            }
            setIsLoadingPosts(true);
            let allPosts = [];
            for (const p_comm of myCommunities) {
                const cId = p_comm.communityId || p_comm._id;
                try {
                    const res = await api.getCommunityContent(cId);
                    const data = res.data || res;
                    const contentArray = data.contents || (Array.isArray(data) ? data : []);

                    if (Array.isArray(contentArray)) {
                        const enrichedData = contentArray.map(post => ({
                            ...post,
                            communityName: p_comm.communityName || 'Unknown Community'
                        }));
                        allPosts = [...allPosts, ...enrichedData];
                    }
                } catch (err) {
                    console.error("Failed to fetch posts for community", cId);
                }
            }
            // Sort by newest first
            allPosts.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
            setPosts(allPosts);
            setIsLoadingPosts(false);
        };

        fetchFeedPosts();
    }, [myCommunities]);

    useEffect(() => {
        const fetchNews = async () => {
            if (activeFilter === 'news' && newsArticles.length === 0) {
                setIsLoadingNews(true);
                try {
                    const data = await api.getAgriNews();
                    // Handle case where backend returns array directly or fallback mock data
                    if (Array.isArray(data)) {
                        setNewsArticles(data);
                    } else if (data && data.articles) {
                        setNewsArticles(data.articles);
                    } else if (data && data.data) {
                        setNewsArticles(data.data);
                    }
                } catch (error) {
                    console.error("Failed to load news", error);
                } finally {
                    setIsLoadingNews(false);
                }
            }
        };
        fetchNews();
    }, [activeFilter, newsArticles.length]);

    const getTagClass = (tag) => {
        if (!tag) return styles.doubtTag;
        if (tag.includes('Knowledge')) return styles.knowledgeTag;
        if (tag.includes('Showcasing')) return styles.showcaseTag;
        return styles.doubtTag;
    };

    const parsePostText = (text = '') => {
        // Obsolete custom parser logic
        return { title: '', body: text };
    };

    useEffect(() => {
        window.addEventListener('communityMembershipChanged', refreshUserCommunities);
        return () => window.removeEventListener('communityMembershipChanged', refreshUserCommunities);
    }, [refreshUserCommunities]);

    return (
        <div className={styles.feedContainer}>

            {/* User Communities Row */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
                        <Users size={18} /> My Communities
                    </h3>
                    <button
                        onClick={() => { refreshUserCommunities(); }}
                        disabled={isLoadingUser}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '8px',
                            border: '1px solid var(--color-border, #ccc)', background: 'var(--color-surface, white)',
                            cursor: isLoadingUser ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem', fontWeight: '500', color: 'var(--color-text-secondary)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <RefreshCw size={14} style={{ animation: isLoadingUser ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>

                {isLoadingUser ? (
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                        <div className={styles.energyLeafContainer} style={{ width: 32, height: 32 }}>
                            <Leaf size={24} className={styles.energyLeafBg} />
                            <Leaf size={24} className={styles.energyLeafFill} />
                        </div>
                    </div>
                ) : (
                    <div className={styles.categoryScroll} style={{
                        display: 'flex',
                        overflowX: 'auto',
                        gap: '1rem',
                        paddingBottom: '0.5rem',
                        scrollbarWidth: 'none'
                    }}>
                        <button
                            className={styles.communityCircle}
                            onClick={() => navigate('/create-community')}
                            style={{
                                minWidth: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-surface)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                border: '2px dashed var(--color-border)', cursor: 'pointer', gap: '4px'
                            }}
                        >
                            <Plus size={20} color="var(--color-text-secondary)" />
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Create</span>
                        </button>

                        {myCommunities.map(c => {
                            const cId = c.communityId || c._id;
                            return (
                                <button
                                    key={cId}
                                    onClick={() => navigate(`/c/${cId}`)}
                                    style={{
                                        minWidth: '80px', width: '80px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', color: 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold',
                                        border: window.location.pathname === `/c/${cId}` ? '3px solid var(--color-primary)' : '3px solid transparent',
                                        boxShadow: window.location.pathname === `/c/${cId}` ? '0 0 0 2px var(--color-primary)' : 'none',
                                        transition: 'all 0.2s'
                                    }}>
                                        {c.communityName ? c.communityName[0].toUpperCase() : 'C'}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                                        {c.communityName}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
                <button
                    className={`${styles.filterChip} ${activeFilter === 'trending' ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter('trending')}
                >
                    <TrendingUp size={16} /> Trending
                </button>
                <button
                    className={`${styles.filterChip} ${activeFilter === 'news' ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter('news')}
                >
                    <Newspaper size={16} /> News
                </button>
                <button
                    className={`${styles.filterChip} ${activeFilter === 'new' ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter('new')}
                >
                    <Clock size={16} /> New
                </button>
                <button
                    className={`${styles.filterChip} ${activeFilter === 'top' ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter('top')}
                >
                    <Star size={16} /> Top
                </button>
                <button
                    className={`${styles.filterChip} ${activeFilter === 'knowledge' ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter('knowledge')}
                >
                    <BookOpen size={16} /> Knowledge
                </button>
                <button
                    className={`${styles.filterChip} ${activeFilter === 'doubts' ? styles.activeFilter : ''}`}
                    onClick={() => setActiveFilter('doubts')}
                >
                    <AlertCircle size={16} /> Doubts
                </button>
            </div>

            {/* Feed Posts */}
            <div className={styles.feedList} style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
                {activeFilter === 'news' ? (
                    isLoadingNews ? (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
                            <div className={styles.energyLeafContainer} style={{ width: 48, height: 48 }}>
                                <Leaf size={48} className={styles.energyLeafBg} />
                                <Leaf size={48} className={styles.energyLeafFill} />
                            </div>
                        </div>
                    ) : newsArticles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                            <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>No news found</h2>
                            <p>Check back later for agriculture updates.</p>
                        </div>
                    ) : (
                        newsArticles.map((article, idx) => (
                            <div key={idx} className={styles.postCard} style={{ background: 'var(--color-surface, white)', border: '1px solid var(--color-border, #E5E7EB)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                                            {article.source?.name || article.source || 'Agriculture News'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                            {article.publishedAt ? new Date(article.publishedAt).toLocaleString() : new Date().toLocaleString()}
                                        </div>
                                    </div>
                                    <button
                                        className={styles.actionBtn}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                                        onClick={async () => {
                                            try {
                                                const shareUrl = article.url || article.link || window.location.href;
                                                if (navigator.share) await navigator.share({ title: article.title, url: shareUrl });
                                                else { await navigator.clipboard.writeText(shareUrl); alert('Link copied!'); }
                                            } catch (e) { console.error(e); }
                                        }}
                                    >
                                        <Share2 size={18} />
                                    </button>
                                </div>

                                {(article.image || article.imageUrl || article.urlToImage) && (
                                    <img src={article.image || article.imageUrl || article.urlToImage} alt={article.title || 'News Image'} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                                )}

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                    {article.url || article.link ? (
                                        <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {article.title || 'Agriculture Update'}
                                        </a>
                                    ) : (
                                        <span>{article.title || 'Agriculture Update'}</span>
                                    )}
                                </h3>
                                <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
                                    {article.description || article.content || article.summary || 'No description provided.'}
                                </p>

                                {(article.url || article.link) && (
                                    <a href={article.url || article.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                                        Read full article <BookOpen size={14} />
                                    </a>
                                )}
                            </div>
                        ))
                    )
                ) : (
                    <>
                        {isLoadingPosts ? (
                            <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
                                <div className={styles.energyLeafContainer} style={{ width: 48, height: 48 }}>
                                    <Leaf size={48} className={styles.energyLeafBg} />
                                    <Leaf size={48} className={styles.energyLeafFill} />
                                </div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                                <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>No posts right now</h2>
                                <p>Join more communities or create a post to get started!</p>
                            </div>
                        ) : (
                            posts.map(post => {
                                const titleText = post.title || '';
                                const bodyText = post.description || post.text || '';
                                return (
                                    <div key={post._id} className={styles.postCard} style={{ background: 'var(--color-surface, white)', border: '1px solid var(--color-border, #E5E7EB)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                                        <div className={styles.postHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div className={styles.userInfo} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <div className={styles.userAvatar} style={{
                                                    width: 40, height: 40, background: 'var(--color-border)', borderRadius: '50%',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-text-secondary)'
                                                }}>
                                                    {(post.creatorId || post.createrId || 'U')[0].toUpperCase()}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div className={styles.userName} style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                                                        {post.creatorId || post.createrId || 'Unknown'}
                                                    </div>
                                                    <div className={styles.postMeta} style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                        {post.communityName || 'Unknown Community'} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                {(post.creatorId === currentUserId || post.createrId === currentUserId) && (
                                                    <button
                                                        onClick={() => handleDelete(post._id)}
                                                        className={styles.iconBtn}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                        title="Delete post"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                                <button className={styles.iconBtn} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                                    <MoreHorizontal size={20} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className={styles.postContent}>
                                            {titleText && <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{titleText}</h3>}

                                            {Array.isArray(post.tags) && post.tags.length > 0 && (
                                                <div className={styles.tagContainer} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                                    {post.tags.map(tag => (
                                                        <span key={tag} style={{
                                                            background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem',
                                                            borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600'
                                                        }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <p className={styles.postBody} style={{ fontSize: '1rem', color: 'var(--color-text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                                                {bodyText}
                                            </p>

                                            {post.media && Array.isArray(post.media) && post.media.length > 0 && post.media[0] && typeof post.media[0] === 'string' && post.media[0].trim() !== '' && (
                                                <img
                                                    src={post.media[0].startsWith('http') ? post.media[0] : `/${post.media[0].replace(/\\+/g, '/').replace(/^\/+/, '')}`}
                                                    alt="Post content"
                                                    className={styles.postImage}
                                                    style={{ marginTop: '1rem', width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '500px', cursor: 'pointer' }}
                                                    onClick={() => setSelectedImage(post.media[0].startsWith('http') ? post.media[0] : `/${post.media[0].replace(/\\+/g, '/').replace(/^\/+/, '')}`)}
                                                />
                                            )}
                                        </div>

                                        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />

                                        <div className={styles.postActions} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={styles.actionBtn}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: post.likes?.includes(currentUserId) ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: '500' }}
                                            >
                                                <ThumbsUp size={18} /> {post.likes?.length || post.upvotes || 0}
                                            </button>
                                            <button
                                                onClick={() => toggleComments(post._id)}
                                                className={styles.actionBtn}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: '500' }}
                                            >
                                                <MessageSquare size={18} /> {post.comments?.length || 0}
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: '500' }}
                                                onClick={() => handleSharePost(post)}
                                            >
                                                <Share2 size={18} /> Share
                                            </button>
                                        </div>

                                        {activeCommentPostId === post._id && (
                                            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border, #E5E7EB)', paddingTop: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                                    <input
                                                        type="text"
                                                        value={commentText}
                                                        onChange={(e) => setCommentText(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid var(--color-border, #ccc)' }}
                                                    />
                                                    <button
                                                        onClick={() => handleComment(post)}
                                                        disabled={!commentText.trim()}
                                                        style={{ padding: '0.5rem 1rem', background: 'var(--color-primary, #60A5FA)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: commentText.trim() ? 1 : 0.6 }}
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                                {isFetchingComments ? (
                                                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-secondary)' }}>Loading comments...</div>
                                                ) : fetchedComments[post._id] && fetchedComments[post._id].length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                        {[...fetchedComments[post._id]].reverse().map((c, i) => (
                                                            <div key={i} style={{ background: 'var(--color-surface, #F9FAFB)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border, #E5E7EB)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <div>
                                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>{c.creatorId || c.userId}</div>
                                                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{c.commentText}</div>
                                                                </div>
                                                                {(c.creatorId === currentUserId || c.userId === currentUserId) && (
                                                                    <button
                                                                        onClick={() => handleDeleteComment(post._id, c._id)}
                                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                                        title="Delete comment"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No comments yet.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        overflow: 'hidden'
                    }}
                    onClick={() => { setSelectedImage(null); setIsZoomed(false); }}
                >
                    <button
                        style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyItems: 'center', zIndex: 10000 }}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setIsZoomed(false); }}
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full screen"
                        style={{
                            maxWidth: '100vw',
                            maxHeight: '100vh',
                            objectFit: 'contain',
                            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                            transform: isZoomed ? 'scale(2)' : 'scale(1)',
                            transformOrigin: 'center center',
                            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        }}
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                    />
                </div>
            )}

            {/* Share to Community Modal */}
            {shareModalPost && (
                <div
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                    }}
                    onClick={() => setShareModalPost(null)}
                >
                    <div
                        style={{
                            background: 'var(--color-surface, white)', borderRadius: '16px', width: '100%', maxWidth: '420px',
                            maxHeight: '70vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--color-border)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>Share to Community</h3>
                            <button onClick={() => setShareModalPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Copy Link */}
                        <button
                            onClick={() => { handleCopyLink(shareModalPost._id); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1.25rem',
                                background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer',
                                color: 'var(--color-text-primary)', fontSize: '0.95rem', width: '100%', textAlign: 'left'
                            }}
                        >
                            <Share2 size={18} style={{ color: 'var(--color-primary)' }} />
                            Copy Link
                        </button>

                        {/* Community List */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
                            <p style={{ padding: '0.25rem 1.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Your Communities
                            </p>
                            {myCommunities.length === 0 ? (
                                <p style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No communities yet.</p>
                            ) : (
                                myCommunities.map(c => {
                                    const cId = c.communityId || c._id;
                                    const isSameCommunity = cId === shareModalPost.communityId;
                                    return (
                                        <button
                                            key={cId}
                                            disabled={isSharing || isSameCommunity}
                                            onClick={() => handleShareToCommunity(cId, c.communityName)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.25rem',
                                                background: 'none', border: 'none', cursor: isSameCommunity ? 'default' : 'pointer',
                                                width: '100%', textAlign: 'left', opacity: isSameCommunity ? 0.5 : 1,
                                                transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={e => { if (!isSameCommunity) e.currentTarget.style.background = 'var(--color-bg, #f3f4f6)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                        >
                                            <div style={{
                                                width: 32, height: 32, borderRadius: '50%',
                                                background: 'var(--color-primary-light, #81C784)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.9rem', fontWeight: '700', flexShrink: 0
                                            }}>
                                                {c.communityName ? c.communityName[0].toUpperCase() : 'C'}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {c.communityName}
                                                </div>
                                                {isSameCommunity && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Current community</div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FeedPage;
