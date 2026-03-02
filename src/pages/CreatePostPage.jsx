import React, { useState, useEffect } from 'react';
import styles from './CreatePostPage.module.css';
import { ChevronDown, Type, ImageIcon, Link, Search, Bold, Italic, Strikethrough, Image as ImgIcon, List, Heading, Code, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

const CreatePostPage = () => {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialCommunityId = searchParams.get('community');

    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(initialCommunityId || '');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);

    const userId = localStorage.getItem('customUserId') || user?.username || user?.id || 'guest';
    const role = localStorage.getItem('userRole') || 'farmer';

    useEffect(() => {
        const fetchUserCommunities = async () => {
            if (!isLoaded || !user) return;
            try {
                const res = await api.getUserCommunities(userId, role);
                const data = res.data || res;
                if (Array.isArray(data)) {
                    setCommunities(data);
                    // If a community was passed in the URL and the user is a member of it, keep it selected.
                    // Otherwise, default to the first one they are a member of.
                    if (data.length > 0 && !initialCommunityId) {
                        setSelectedCommunity(data[0].communityId || data[0]._id);
                    } else if (initialCommunityId && !data.some(c => (c.communityId || c._id) === initialCommunityId)) {
                        // The user isn't in this community, reset it
                        setSelectedCommunity(data.length > 0 ? (data[0].communityId || data[0]._id) : '');
                    }
                } else if (data && typeof data === 'object') {
                    setCommunities(Object.keys(data).length > 0 ? [data] : []);
                    const cId = data.communityId || data._id;
                    if (Object.keys(data).length > 0 && (!initialCommunityId || initialCommunityId !== cId)) {
                        setSelectedCommunity(cId);
                    }
                }
            } catch (error) {
                console.error("Error fetching communities for post:", error);
            } finally {
                setIsLoadingCommunities(false);
            }
        };
        fetchUserCommunities();
    }, [isLoaded, user, userId, role]);

    const handleSubmit = async () => {
        if (!title.trim() || !selectedCommunity) return;
        setIsSubmitting(true);

        try {
            if (mediaFile) {
                const formData = new FormData();
                formData.append('communityId', selectedCommunity);
                formData.append('creatorId', userId);
                formData.append('title', title);
                formData.append('description', body);
                formData.append('createdAt', new Date().toISOString());
                if (tagsInput.trim()) formData.append('tags', tagsInput.trim());
                formData.append('media', mediaFile);
                await api.createContent(formData);
            } else {
                const payload = {
                    communityId: selectedCommunity,
                    creatorId: userId,
                    title: title,
                    description: body,
                    createdAt: new Date().toISOString(),
                    tags: tagsInput.trim() ? [tagsInput.trim()] : []
                };
                await api.createContent(payload);
            }

            navigate(`/c/${selectedCommunity}`);
        } catch (error) {
            console.error("Failed to post:", error);
            alert("Could not post content. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.createPostPage}>
            <div className={styles.header}>
                <h1>Create post</h1>
                <span className={styles.drafts}>Drafts <span className={styles.draftBadge}>0</span></span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.communitySelector}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <select
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 36px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            appearance: 'none',
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                        disabled={isLoadingCommunities || communities.length === 0}
                    >
                        {isLoadingCommunities ? (
                            <option value="">Loading communities...</option>
                        ) : communities.length === 0 ? (
                            <option value="">Join a community to post</option>
                        ) : (
                            communities.map(c => (
                                <option key={c.communityId || c._id} value={c.communityId || c._id}>
                                    {c.communityName}
                                </option>
                            ))
                        )}
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
                </div>
            </div>

            <div className={styles.postCard}>
                <div className={styles.postForm}>
                    <div className={styles.titleWrapper}>
                        <input
                            type="text"
                            placeholder="Title*"
                            className={styles.titleInput}
                            maxLength={300}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <span className={styles.charCount}>{title.length}/300</span>
                    </div>

                    <div className={styles.titleWrapper}>
                        <input
                            type="text"
                            placeholder="Comma-separated tags (e.g. Organic, Tips)"
                            className={styles.titleInput}
                            style={{ margin: '1rem 0', borderRadius: '8px' }}
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                        />
                    </div>

                    <div className={styles.editorWrapper}>
                        <textarea
                            placeholder="Description / Body text (optional)"
                            className={styles.bodyInput}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        ></textarea>
                    </div>

                    <div className={styles.mediaUploadWrapper}>
                        <label className={styles.uploadBox}>
                            <ImageIcon size={32} color="var(--color-primary)" style={{ marginBottom: '0.5rem' }} />
                            <span>{mediaFile ? mediaFile.name : 'Click to upload image or video'}</span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                className={styles.hiddenFileInput}
                                onChange={(e) => setMediaFile(e.target.files[0])}
                            />
                        </label>
                    </div>

                    <div className={styles.formActions}>
                        <button className={styles.saveDraftBtn}>Save Draft</button>
                        <button
                            className={styles.submitBtn}
                            disabled={!title.trim() || !selectedCommunity || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? <Loader2 size={16} className={styles.spin} style={{ animation: 'spin 1s linear infinite' }} /> : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
