import React from 'react';
import { Users, BookOpen, UserCheck, Tractor, Languages, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './FeaturesGrid.module.css';

const icons = [
    <Users size={28} />,
    <BookOpen size={28} />,
    <UserCheck size={28} />,
    <Tractor size={28} />,
    <Languages size={28} />,
    <ShieldCheck size={28} />
];

const FeaturesGrid = () => {
    const { t } = useLanguage();

    return (
        <section className={styles.features}>
            <div className={styles.gridContainer}>
                <div className={styles.header}>
                    <span className={styles.badge}>{t.features.badge}</span>
                    <h2 className={styles.title}>{t.features.title}</h2>
                    <p className={styles.subtext}>{t.features.subtext}</p>
                </div>

                <div className={styles.grid}>
                    {t.features.list.map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <span className={styles.number}>0{index + 1}</span>
                            <div className={`${styles.iconWrapper} ${styles[`icon${index}`]}`}>
                                {icons[index]}
                            </div>
                            <div>
                                <h3 className={styles.featureTitle}>{feature.title}</h3>
                                <p className={styles.featureDesc}>{feature.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesGrid;
