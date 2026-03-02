import React from 'react';
import { X, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './WhyAgroW.module.css';

const WhyAgroW = () => {
    const { t } = useLanguage();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}>{t.comparison.badge}</span>
                    <h2 className={styles.title}>{t.comparison.title}</h2>
                    <p className={styles.subtext}>{t.comparison.subtext}</p>
                </div>

                <div className={styles.comparisonGrid}>
                    {/* Without AgroW */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.withoutHeader}`}>
                            <X size={18} /> {t.comparison.without.title}
                        </div>
                        <div className={styles.list}>
                            {t.comparison.without.items.map((item, index) => (
                                <div key={index} className={styles.item}>
                                    <X size={20} className={`${styles.icon} ${styles.crossIcon}`} />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* With AgroW */}
                    <div className={styles.column}>
                        <div className={`${styles.columnHeader} ${styles.withHeader}`}>
                            <Check size={18} /> {t.comparison.with.title}
                        </div>
                        <div className={styles.list}>
                            {t.comparison.with.items.map((item, index) => (
                                <div key={index} className={`${styles.item} ${styles.withItem}`}>
                                    <Check size={20} className={`${styles.icon} ${styles.checkIcon}`} />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyAgroW;
