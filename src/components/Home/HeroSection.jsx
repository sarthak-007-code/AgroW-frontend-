import React, { useState } from 'react';
import { Sprout, Tractor, ArrowRight, BookOpen, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import styles from './HeroSection.module.css';

const HeroSection = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const { t } = useLanguage();

    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        localStorage.setItem('userRole', role);
        navigate('/auth?mode=sign-up', { state: { role } });
    };

    return (
        <section className={styles.hero}>
            <div className={styles.heroContainer}>
                {/* Left Content */}
                <div className={styles.content}>
                    <div className={styles.trustBadge}>
                        <span className={styles.dot}>●</span> {t.hero.trustBadge}
                    </div>

                    <h1 className={styles.heading}>
                        {t.hero.title} <span className={styles.highlight}>{t.hero.titleHighlight}</span>
                    </h1>
                    <p className={styles.subtext}>
                        {t.hero.subtext}
                    </p>

                    <ul className={styles.benefits}>
                        {t.hero.benefits.map((benefit, index) => (
                            <li key={index} className={styles.benefitItem}>
                                <BookOpen size={20} className={styles.benefitIcon} />
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    <div className={styles.roleSelection}>
                        <p className={styles.roleLabel}>{t.hero.roleLabel}</p>
                        <div className={styles.cardsGrid}>
                            <div
                                className={styles.roleCard}
                                onClick={() => handleRoleSelect('farmer')}
                            >
                                <div className={styles.iconWrapper}>
                                    <Sprout size={28} />
                                </div>
                                <div>
                                    <h3 className={styles.cardTitle}>{t.hero.roles.farmer.title}</h3>
                                    <p className={styles.cardDesc}>{t.hero.roles.farmer.desc}</p>
                                </div>
                                <span className={styles.ctaLink}>
                                    {t.hero.roles.farmer.cta}
                                </span>
                            </div>

                            <div
                                className={styles.roleCard}
                                onClick={() => handleRoleSelect('provider')}
                            >
                                <div className={`${styles.iconWrapper} ${styles.iconProvider}`}>
                                    <Tractor size={28} />
                                </div>
                                <div>
                                    <h3 className={styles.cardTitle}>{t.hero.roles.provider.title}</h3>
                                    <p className={styles.cardDesc}>{t.hero.roles.provider.desc}</p>
                                </div>
                                <span className={styles.ctaLink}>
                                    {t.hero.roles.provider.cta}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Visual */}
                <div className={styles.visual}>
                    <div className={styles.feedContainer}>
                        <div className={styles.feedHeader}>
                            <div className={styles.feedTitle}>{t.hero.feed.header}</div>
                            <div className={styles.liveBadge}>{t.hero.feed.live}</div>
                        </div>

                        {/* Post 1: Farmer Question */}
                        <div className={`${styles.feedItem} ${styles.questionItem}`}>
                            <div className={styles.userHeader}>
                                <div className={styles.userAvatar}>RS</div>
                                <div className={styles.userInfo}>
                                    <h4>{t.hero.feed.post.user} <span className={styles.userTag}>{t.hero.feed.post.tag}</span></h4>
                                </div>
                            </div>
                            <p className={styles.postContent}>{t.hero.feed.post.content}</p>
                            <div className={styles.interactionBar}>
                                {t.hero.feed.post.interaction}
                            </div>
                        </div>

                        {/* Post 2: Tractor Service */}
                        <div className={`${styles.feedItem} ${styles.serviceItem}`}>
                            <div className={styles.serviceHeader}>
                                <div className={styles.serviceIcon}><Tractor size={18} /></div>
                                <div className={styles.serviceInfo}>
                                    <h4>{t.hero.feed.service.title}</h4>
                                    <div className={styles.serviceMeta}>
                                        <MapPin size={12} /> {t.hero.feed.service.location}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.serviceRow}>
                                <div>{t.hero.feed.service.rating}</div>
                                <div className={styles.priceTag}>{t.hero.feed.service.price}</div>
                            </div>
                        </div>

                        {/* Post 3: Expert Advice */}
                        <div className={`${styles.feedItem} ${styles.expertItem}`}>
                            <div className={styles.userHeader}>
                                <div className={styles.userAvatar} style={{ background: '#7B1FA2' }}>AK</div>
                                <div className={styles.userInfo}>
                                    <h4>{t.hero.feed.expert.name} <span className={styles.expertBadge}>{t.hero.feed.expert.badge}</span></h4>
                                </div>
                            </div>
                            <p className={styles.postContent}>{t.hero.feed.expert.content}</p>
                        </div>

                    </div>
                </div>

                {/* Stats Strip */}
                <div className={styles.statsStrip}>
                    {t.hero.stats.map((stat, i) => (
                        <div key={i} className={styles.statItem}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
