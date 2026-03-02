import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import styles from './CreateCommunityPage.module.css';

const CreateCommunityPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [name, setName] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [village, setVillage] = useState('');
    const [searchTags, setSearchTags] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                communityName: name,
                membersId: [localStorage.getItem('customUserId') || user?.username || user?.id || 'guest'],
                content: [],
                state: state,
                district: district,
                village: village,
                communitySearchTagList: searchTags.split(',').map(tag => tag.trim()).filter(val => val !== ''),
                communityCreatedOn: new Date().toISOString()
            };
            await api.createCommunity(payload);
            // Fire event so Sidebar and Feed know a new community was joined
            window.dispatchEvent(new Event('communityMembershipChanged'));
            navigate('/c/communities');
        } catch (error) {
            console.error("Failed to create community", error);
            alert("Could not create community. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2>Create a Community</h2>
                <p>Build a space for farmers and providers to connect.</p>

                <form onSubmit={handleCreate} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Community Name</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Nashik Grape Farmers"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>State</label>
                        <input
                            type="text"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>District</label>
                        <input
                            type="text"
                            placeholder="District"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Village</label>
                        <input
                            type="text"
                            placeholder="Village"
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Community Search Tags</label>
                        <input
                            type="text"
                            placeholder="e.g. organic, tractors, subsidies (comma separated)"
                            value={searchTags}
                            onChange={(e) => setSearchTags(e.target.value)}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={() => navigate(-1)} disabled={isSubmitting}>Cancel</button>
                        <button type="submit" className={styles.createBtn} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Community'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunityPage;
