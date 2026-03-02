import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, ArrowRight, MapPin, Sprout, Tractor,
    CheckCircle, ChevronDown, Check, RefreshCw, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api';
import { getAllStates, getDistricts } from 'india-state-district';
import toast from 'react-hot-toast';
import styles from './OnboardingPage.module.css';

const OnboardingPage = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    // State
    const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'farmer');
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        gender: '',
        address: '',
        state: '',
        stateCode: '',
        district: '',
        taluka: '',
        village: '',
        crops: [],
        farmSize: '',
        interests: [],
        services: [],
        communities: [],
        otherServiceType: '',
        serviceDesc: ''
    });

    const [availableCommunities, setAvailableCommunities] = useState([]);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);

    const fetchAllComms = async () => {
        setIsLoadingCommunities(true);
        try {
            const res = await api.getAllCommunities();
            const data = res.data || res;
            if (Array.isArray(data)) {
                setAvailableCommunities(data);
            }
        } catch (error) {
            console.error("Failed to fetch communities for onboarding", error);
        } finally {
            setIsLoadingCommunities(false);
        }
    };

    useEffect(() => {
        fetchAllComms();
    }, []);

    // Prefill email from Clerk user session
    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            setFormData(prev => ({ ...prev, email: user.primaryEmailAddress.emailAddress }));
        }
    }, [user]);

    // Mock Data
    const interestsList = [
        { id: 'schemes', label: 'Government Schemes' },
        { id: 'modern', label: 'Modern Farming Practices' },
        { id: 'organic', label: 'Organic Farming' },
        { id: 'machinery', label: 'Machinery & Tools' },
        { id: 'expert', label: 'Expert Advice' }
    ];

    const serviceTypes = ['Tractor Rental', 'Harvester', 'Expert Consultation', 'Equipment Rental', 'Labor Supply'];

    // Handlers
    const handleNext = async () => {
        if (step === 1) {
            if (!formData.username.trim() || !formData.firstName.trim() || !formData.lastName.trim() || !formData.gender) {
                alert("Please fill in all the required fields: Username, First Name, Last Name, and Gender.");
                return;
            }
        } else if (step === 2) {
            if (!formData.stateCode || !formData.district || !formData.taluka.trim() || !formData.village.trim()) {
                alert("Please fill in all location details: State, District, Taluka, and Village.");
                return;
            }
        } else if (step === 3) {
            if (role === 'farmer' && formData.crops.length === 0) {
                alert("Please select at least one crop.");
                return;
            } else if (role === 'provider') {
                if (formData.services.length === 0) {
                    alert("Please select at least one service.");
                    return;
                }
                if (formData.services.includes('Others') && !formData.serviceDesc.trim()) {
                    alert("Please describe your 'Other' service.");
                    return;
                }
            }
        } else if (step === 4) {
            if (formData.interests.length === 0) {
                alert("Please select at least one interest.");
                return;
            }
        } else if (step === 5) {
            if (formData.communities.length < 3) {
                alert(`Please select at least 3 communities to join. You have selected ${formData.communities.length}.`);
                return;
            }
        }

        if (step === 5) {
            setIsSubmitting(true);
            try {
                const customUserId = formData.username?.trim() || user?.id || 'guest';
                localStorage.setItem('customUserId', customUserId);

                const basePayload = {
                    userId: customUserId,
                    firstName: formData.firstName?.trim() || '',
                    lastName: formData.lastName?.trim() || '',
                    email: (formData.email || user?.primaryEmailAddress?.emailAddress || '').trim(),
                    gender: formData.gender || "Not Specified",
                    state: formData.state,
                    district: formData.district,
                    village: formData.village?.trim() || '',
                    interestedList: formData.interests,
                    joinedCommunities: formData.communities
                };

                if (role === 'farmer') {
                    await api.createFarmer({
                        ...basePayload,
                        cropList: formData.crops
                    });
                } else {
                    const finalServices = formData.services.map(s =>
                        s === 'Others' ? `Others: ${formData.serviceDesc}` : s
                    );
                    await api.createServiceProvider({
                        ...basePayload,
                        serviceList: finalServices.length > 0 ? finalServices : [formData.serviceDesc]
                    });
                }

                // Add member to selected communities sequentially so the backend is updated with memberships
                for (const communityId of formData.communities) {
                    try {
                        await api.addMemberToCommunity(communityId, role, customUserId);
                    } catch (e) {
                        console.error(`Failed to join community ${communityId}`, e);
                    }
                }
                toast.success(`Successfully joined ${formData.communities.length} communities! Welcome!`);

                navigate('/feed');
            } catch (error) {
                console.error('Error during onboarding API call:', error);
                // Optionally show error to user, but continue to feed right now to not block flow
                navigate('/feed');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setStep(prev => prev + 1);
        }
    };
    const handleBack = () => setStep(prev => prev - 1);

    const handleCropToggle = (cropValue) => {
        setFormData(prev => ({
            ...prev,
            crops: prev.crops.includes(cropValue)
                ? prev.crops.filter(c => c !== cropValue)
                : [...prev.crops, cropValue]
        }));
    };

    const handleServiceToggle = (serviceValue) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(serviceValue)
                ? prev.services.filter(s => s !== serviceValue)
                : [...prev.services, serviceValue]
        }));
    };

    const handleInterestToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(id)
                ? prev.interests.filter(i => i !== id)
                : [...prev.interests, id]
        }));
    };

    const handleCommunityToggle = (id) => {
        setFormData(prev => ({
            ...prev,
            communities: prev.communities.includes(id)
                ? prev.communities.filter(c => c !== id)
                : [...prev.communities, id]
        }));
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        const stateName = e.target.options[e.target.selectedIndex].text;

        setFormData(prev => ({
            ...prev,
            stateCode: stateCode,
            state: stateName,
            district: '' // Reset district when state changes
        }));
    };


    // Render Steps
    const renderProgressBar = () => (
        <div className={styles.progressContainer}>
            <div className={styles.progressSteps}>
                {[1, 2, 3, 4, 5].map(num => (
                    <div key={num} className={`${styles.stepIndicator} ${step >= num ? `${styles.activeStep} ${role === 'provider' ? styles.provider : ''}` : ''}`}>
                        {step > num ? <Check size={16} /> : num}
                    </div>
                ))}
                <div className={styles.progressBarBg}>
                    <div
                        className={styles.progressBarFill}
                        style={{ width: `${((step - 1) / 4) * 100}%` }}
                    ></div>
                </div>
            </div>
            <p className={styles.stepLabel}>Step {step} of 5</p>
        </div>
    );

    const renderStep1_Profile = () => (
        <div className={styles.stepContent}>
            <h2 className={role === 'provider' ? styles.provider : ''}>Basic Details</h2>
            <p className={styles.helperText}>Let's start with some basic information.</p>

            <div className={styles.formGroup}>
                <label>Username</label>
                <input
                    type="text"
                    placeholder="Choose a username (e.g. ram_patil_99)"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    className={styles.textInput}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input
                        type="text"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        className={styles.textInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Last Name</label>
                    <input
                        type="text"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        className={styles.textInput}
                    />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label>Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            readOnly
                            className={styles.textInput}
                            style={{ backgroundColor: 'var(--color-bg)', opacity: 0.85, cursor: 'not-allowed', paddingRight: '2.5rem' }}
                        />
                        <Lock size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Gender</label>
                    <div className={styles.selectWrapper}>
                        <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)} className={styles.textInput} style={{ appearance: 'none', paddingRight: '2.5rem' }}>
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        <ChevronDown className={styles.selectIcon} size={20} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2_Location = () => (
        <div className={styles.stepContent}>
            <h2 className={role === 'provider' ? styles.provider : ''}>Where are you located?</h2>
            <p className={styles.helperText}>This helps us connect you with nearby {role === 'farmer' ? 'farmers and services' : 'customers'}.</p>

            <div className={styles.formGroup}>
                <label>State</label>
                <div className={styles.selectWrapper}>
                    <select
                        value={formData.stateCode}
                        onChange={handleStateChange}
                        className={styles.textInput}
                        style={{ appearance: 'none', paddingRight: '2.5rem' }}
                        required
                    >
                        <option value="" disabled>Select State</option>
                        {getAllStates().map(state => (
                            <option key={state.code} value={state.code}>{state.name}</option>
                        ))}
                    </select>
                    <ChevronDown className={styles.selectIcon} size={20} />
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.formGroup}>
                    <label>District</label>
                    <div className={styles.selectWrapper}>
                        <select
                            value={formData.district}
                            onChange={(e) => handleChange('district', e.target.value)}
                            className={styles.textInput}
                            style={{ appearance: 'none', paddingRight: '2.5rem' }}
                            disabled={!formData.stateCode}
                            required
                        >
                            <option value="" disabled>{formData.stateCode ? "Select District" : "Select State First"}</option>
                            {formData.stateCode && getDistricts(formData.stateCode).map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                        <ChevronDown className={styles.selectIcon} size={20} />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Taluka</label>
                    <input
                        type="text"
                        placeholder="Enter Taluka"
                        value={formData.taluka}
                        onChange={(e) => handleChange('taluka', e.target.value)}
                        className={styles.textInput}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label>Village</label>
                <input
                    type="text"
                    placeholder="Enter Village Name"
                    value={formData.village}
                    onChange={(e) => handleChange('village', e.target.value)}
                    className={styles.textInput}
                />
            </div>
        </div>
    );

    const renderStep3_Farmer = () => {
        const cropsList = [
            // Cereals & Grains
            'Wheat', 'Rice (Paddy)', 'Maize (Corn)', 'Jowar (Sorghum)', 'Bajra (Pearl Millet)', 'Ragi (Finger Millet)', 'Barley', 'Oats',
            // Pulses
            'Gram (Chana)', 'Toor (Arhar)', 'Moong', 'Urad', 'Masoor (Lentil)', 'Peas', 'Cowpea',
            // Oilseeds
            'Soybean', 'Groundnut', 'Mustard / Rapeseed', 'Sunflower', 'Sesame (Til)', 'Castor', 'Linseed',
            // Cash Crops & Commercial
            'Sugarcane', 'Cotton', 'Jute', 'Tobacco', 'Guar',
            // Plantation & Spices
            'Tea', 'Coffee', 'Rubber', 'Coconut', 'Arecanut', 'Cashew', 'Cardamom', 'Pepper', 'Turmeric', 'Ginger', 'Chilli', 'Coriander', 'Cumin', 'Fennel', 'Garlic',
            // Fruits & Vegetables
            'Mango', 'Banana', 'Grapes', 'Apple', 'Pomegranate', 'Papaya', 'Guava', 'Citrus / Orange', 'Pineapple', 'Onion', 'Tomato', 'Potato', 'Cauliflower', 'Cabbage', 'Brinjal', 'Okra (Bhindi)'
        ];

        return (
            <div className={styles.stepContent}>
                <h2 className={role === 'provider' ? styles.provider : ''}>Tell us about your farm</h2>
                <p className={styles.helperText}>Select the primary crops you grow or plan to grow.</p>

                <div className={styles.formGroup}>
                    <div className={styles.checkboxGrid} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '12px',
                        marginTop: '16px',
                        maxHeight: '350px',
                        overflowY: 'auto',
                        padding: '4px',
                        paddingRight: '12px'
                    }}>
                        {cropsList.map(crop => (
                            <label key={crop} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                color: '#333'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData.crops.includes(crop.toLowerCase())}
                                    onChange={() => handleCropToggle(crop.toLowerCase())}
                                    style={{ width: '18px', height: '18px', accentColor: '#2E7D32', flexShrink: 0 }}
                                />
                                {crop}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderStep3_Provider = () => {
        const servicesList = [
            'Tractor Rental', 'Harvester Rental', 'Drone Spraying', 'Labor Supply',
            'Plant Pathology', 'Agriculture Expert Consultation', 'Soil Testing',
            'Seed Supply', 'Fertilizer Supply', 'Pesticide Supply', 'Cold Storage',
            'Transportation Delivery', 'Thresher Machine', 'Water Pump Rental', 'Others'
        ];

        return (
            <div className={styles.stepContent}>
                <h2 className={role === 'provider' ? styles.provider : ''}>What service do you offer?</h2>
                <p className={styles.helperText}>Select the primary services you can provide to farmers.</p>

                <div className={styles.formGroup}>
                    <div className={styles.checkboxGrid} style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '12px',
                        marginTop: '16px',
                        maxHeight: '250px',
                        overflowY: 'auto',
                        padding: '4px',
                        paddingRight: '12px'
                    }}>
                        {servicesList.map(service => (
                            <label key={service} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                color: '#333'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData.services.includes(service)}
                                    onChange={() => handleServiceToggle(service)}
                                    style={{ width: '18px', height: '18px', accentColor: '#ea580c', flexShrink: 0 }}
                                />
                                {service}
                            </label>
                        ))}
                    </div>
                </div>

                {formData.services.includes('Others') && (
                    <div className={styles.formGroup}>
                        <label>Specify Other Services</label>
                        <textarea
                            placeholder="Describe your equipment, any unlisted services, rates, or expertise..."
                            value={formData.serviceDesc}
                            onChange={(e) => handleChange('serviceDesc', e.target.value)}
                            className={styles.textArea}
                            rows={3}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderStep4_Interests = () => (
        <div className={styles.stepContent}>
            <h2 className={role === 'provider' ? styles.provider : ''}>What are you interested in?</h2>
            <p className={styles.helperText}>Select topics to personalize your feed.</p>

            <div className={styles.interestsGrid}>
                {interestsList.map(item => (
                    <button
                        key={item.id}
                        className={`${styles.interestCard} ${formData.interests.includes(item.id) ? styles.selectedInterest : ''}`}
                        onClick={() => handleInterestToggle(item.id)}
                    >
                        {formData.interests.includes(item.id) && <CheckCircle size={18} className={styles.checkIcon} />}
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );



    const renderStep5_Communities = () => (
        <div className={styles.stepContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h2 className={role === 'provider' ? styles.provider : ''} style={{ margin: 0 }}>Join Communities</h2>
                    <p className={styles.helperText} style={{ margin: '4px 0 0 0' }}>Please select at least 3 communities to join to complete your setup.</p>
                </div>
                <button
                    onClick={fetchAllComms}
                    disabled={isLoadingCommunities}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px',
                        border: '1px solid #ccc', background: 'white',
                        cursor: isLoadingCommunities ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem', fontWeight: '500', color: '#333',
                        transition: 'background 0.2s'
                    }}
                >
                    <RefreshCw size={16} style={{ animation: isLoadingCommunities ? 'spin 1s linear infinite' : 'none' }} />
                    Refresh
                </button>
            </div>
            <div className={styles.interestsGrid} style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px', marginTop: '16px' }}>
                {isLoadingCommunities ? (
                    <p>Loading communities...</p>
                ) : availableCommunities.length === 0 ? (
                    <p>No communities found. (You may proceed directly).</p>
                ) : (
                    availableCommunities.map(community => {
                        const commId = community.communityId || community._id;
                        const isSelected = formData.communities.includes(commId);
                        return (
                            <button
                                key={commId}
                                className={`${styles.interestCard} ${isSelected ? styles.selectedInterest : ''}`}
                                onClick={() => handleCommunityToggle(commId)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', minHeight: '80px', justifyContent: 'center' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    {isSelected && <CheckCircle size={18} className={styles.checkIcon} style={{ marginRight: '8px', flexShrink: 0 }} />}
                                    <span style={{ fontWeight: '600', textAlign: 'left', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {community.communityName}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.8)' : '#666', marginTop: '4px' }}>
                                    {community.memberCount || 0} Members
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );



    return (
        <div className={styles.container}>
            {/* Illustration Side (Laptop only) */}
            <div className={`${styles.sidePanel} ${role === 'provider' ? styles.provider : ''}`}>
                <div className={`${styles.illustration} ${role === 'provider' ? styles.provider : ''}`}>
                    {role === 'farmer' ? <Sprout size={120} /> : <Tractor size={120} />}
                </div>
                <h2 className={styles.sideTitle}>
                    {role === 'farmer' ? 'Grow Better, Together.' : 'Expand Your Reach.'}
                </h2>
                <p className={styles.sideText}>
                    {role === 'farmer'
                        ? "Join thousands of farmers sharing knowledge and resources."
                        : "Connect directly with farmers who need your services."}
                </p>


            </div>

            {/* Form Area */}
            <div className={styles.mainArea}>
                <div className={styles.wizardWidth}>
                    {renderProgressBar()}

                    <div className={styles.stepContainer}>
                        {step === 1 && renderStep1_Profile()}
                        {step === 2 && renderStep2_Location()}
                        {step === 3 && (role === 'farmer' ? renderStep3_Farmer() : renderStep3_Provider())}
                        {step === 4 && renderStep4_Interests()}
                        {step === 5 && renderStep5_Communities()}
                    </div>

                    <div className={styles.actions}>
                        {step > 1 ? (
                            <button onClick={handleBack} className={styles.backBtn}>
                                Back
                            </button>
                        ) : (
                            <div className={styles.spacer}></div>
                        )}

                        <button onClick={handleNext} className={`${styles.nextBtn} ${role === 'provider' ? styles.provider : ''}`} disabled={isSubmitting}>
                            {step === 5
                                ? (isSubmitting ? 'Submitting...' : 'Complete & Go to Feed')
                                : 'Continue'
                            }
                            {step < 5 && <ArrowRight size={18} />}
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
