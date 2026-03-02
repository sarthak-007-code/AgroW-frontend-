import React, { useState, useEffect } from 'react';
import styles from './CommunityPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import { useUserContext } from '../context/UserContext';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Trash2, X, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

const CommunityPage = () => {
    const { communityId } = useParams();
    const { user } = useUser();
    const { userData: contextUserData, refreshUserCommunities, myCommunities: userCommunities } = useUserContext();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [communityName, setCommunityName] = useState(communityId);
    const [isMember, setIsMember] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [fetchedComments, setFetchedComments] = useState({});
    const [isFetchingComments, setIsFetchingComments] = useState(false);
    const [shareModalPost, setShareModalPost] = useState(null);
    const [isSharing, setIsSharing] = useState(false);

    const userId = contextUserData?.userId || contextUserData?._id || localStorage.getItem('customUserId') || user?.username || user?.id || 'guest';
    const role = localStorage.getItem('userRole') || 'farmer';



    const fetchPosts = async () => {
        try {
            const res = await api.getCommunityContent(communityId);
            const data = res.data || res;
            if (data && Array.isArray(data.contents)) {
                setPosts([...data.contents].reverse());
            } else if (Array.isArray(data)) {
                setPosts([...data].reverse());
            } else {
                setPosts([]);
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                // Fetch all communities to find the specific name (since there is no getSingleCommunity API in schema)
                const res = await api.getAllCommunities();
                const data = res.data || res;
                if (Array.isArray(data)) {
                    const matchedCommunity = data.find(c => (c.communityId || c._id) === communityId);
                    if (matchedCommunity) {
                        if (matchedCommunity.communityName) {
                            setCommunityName(matchedCommunity.communityName);
                        }
                        if (matchedCommunity.membersId && matchedCommunity.membersId.includes(userId)) {
                            setIsMember(true);
                        } else {
                            setIsMember(false);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch community details", error);
            }
        };

        setIsLoading(true);
        fetchCommunityDetails();
        fetchPosts();
    }, [communityId, userId]);

    const handleJoinLeaveClick = async () => {
        try {
            if (isMember) {
                await api.removeMemberFromCommunity(communityId, role, userId);
                setIsMember(false);
                toast.success(`Left ${communityName}`);
            } else {
                await api.addMemberToCommunity(communityId, role, userId);
                setIsMember(true);
                toast.success(`Welcome to ${communityName}!`);
            }
            window.dispatchEvent(new Event('communityMembershipChanged'));
            refreshUserCommunities();
        } catch (error) {
            console.error("Failed to toggle community membership", error);
            toast.error("Could not update membership status.");
        }
    };

    const navigate = useNavigate();

    const handleCreatePostNav = () => {
        navigate(`/submit?community=${communityId}`);
    };

    const parsePostText = (text = '') => {
        // Obsolete custom parser logic
        return { title: '', body: text };
    };

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
            await api.likeContent(postId, userId);
            setPosts(posts => posts.map(p => {
                if (p._id === postId) {
                    const hasLiked = p.likes?.includes(userId);
                    return {
                        ...p,
                        likes: hasLiked ? p.likes.filter(id => id !== userId) : [...(p.likes || []), userId]
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
        if (!commentText.trim()) return;
        try {
            const commentUser = user?.username || user?.firstName || userId;
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
                creatorId: userId,
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

    return (
        <div className={styles.simpleContainer}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h1>{communityName}</h1>
                    <p className={styles.subtitle}>Community Feed</p>
                </div>
                <button
                    className={styles.joinBtn}
                    onClick={handleJoinLeaveClick}
                    style={{
                        background: isMember ? 'transparent' : 'var(--color-primary)',
                        color: isMember ? 'var(--color-text-primary)' : 'white',
                        border: isMember ? '1px solid var(--color-border)' : 'none'
                    }}
                >
                    {isMember ? 'Leave' : 'Join'}
                </button>
            </div>

            {/* Create Post Area */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', background: 'var(--color-surface, white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border, #ccc)', color: 'var(--color-text-secondary)', cursor: 'text', background: 'var(--color-background)' }}
                    onClick={handleCreatePostNav}
                >
                    Create a new post in {communityName}...
                </div>
                <button
                    onClick={handleCreatePostNav}
                    className={styles.actionBtn}
                >
                    Create Post
                </button>
            </div>

            <div className={styles.feed} style={{ minHeight: '300px' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
                        <div className={styles.energyLeafContainer} style={{ width: 48, height: 48 }}>
                            <Leaf size={48} className={styles.energyLeafBg} />
                            <Leaf size={48} className={styles.energyLeafFill} />
                        </div>
                    </div>
                ) : posts.length > 0 ? (
                    posts.map(post => {
                        const titleText = post.title || '';
                        const bodyText = post.description || post.text || '';
                        return (
                            <div key={post._id} style={{ background: 'var(--color-surface, white)', border: '1px solid var(--color-border, #E5E7EB)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{
                                            width: 40, height: 40, background: 'var(--color-border)', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-text-secondary)'
                                        }}>
                                            {(post.creatorId || post.createrId || 'U')[0].toUpperCase()}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                                                {post.creatorId || post.createrId || 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {communityName} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        {(post.creatorId === userId || post.createrId === userId) && (
                                            <button
                                                onClick={() => handleDelete(post._id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                title="Delete post"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    {titleText && <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>{titleText}</h3>}

                                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
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

                                    <p style={{ fontSize: '1rem', color: 'var(--color-text-primary)', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {bodyText}
                                    </p>

                                    {post.media && Array.isArray(post.media) && post.media.length > 0 && post.media[0] && typeof post.media[0] === 'string' && post.media[0].trim() !== '' && (
                                        <img
                                            src={post.media[0].startsWith('http') ? post.media[0] : `/${post.media[0].replace(/\\+/g, '/').replace(/^\/+/, '')}`}
                                            alt="Post content"
                                            style={{ marginTop: '1rem', width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '500px', cursor: 'pointer' }}
                                            onClick={() => setSelectedImage(post.media[0].startsWith('http') ? post.media[0] : `/${post.media[0].replace(/\\+/g, '/').replace(/^\/+/, '')}`)}
                                        />
                                    )}
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />

                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: post.likes?.includes(userId) ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: '500' }}
                                    >
                                        <ThumbsUp size={18} /> {post.likes?.length || post.upvotes || 0}
                                    </button>
                                    <button
                                        onClick={() => toggleComments(post._id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontWeight: '500' }}
                                    >
                                        <MessageSquare size={18} /> {post.comments?.length || 0}
                                    </button>
                                    <button
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
                                                        {(c.creatorId === userId || c.userId === userId) && (
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
                ) : (
                    <div className={styles.emptyFeedState}>
                        <h2>This community doesn't have any posts yet</h2>
                        <p>Make one and get this feed started.</p>
                        <button className={styles.actionBtn} onClick={handleCreatePostNav}>Create Post</button>
                    </div>
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

                        <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
                            <p style={{ padding: '0.25rem 1.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Your Communities
                            </p>
                            {userCommunities.length === 0 ? (
                                <p style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>No communities yet.</p>
                            ) : (
                                userCommunities.map(c => {
                                    const cId = c.communityId || c._id;
                                    const isSameCommunity = cId === communityId;
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

export default CommunityPage;
