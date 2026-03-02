import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Testimonials.module.css';

const Testimonials = () => {
    const { t } = useLanguage();

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {t.testimonials.map((item, index) => (
                        <div key={index} className={styles.card}>
                            <span className={styles.quoteIcon}>“</span>
                            <p className={styles.quote}>{item.quote}</p>

                            <div className={styles.author}>
                                <div className={styles.avatar}>
                                    {item.author.charAt(0)}
                                </div>
                                <div className={styles.info}>
                                    <h4>{item.author}</h4>
                                    <p className={styles.location}>{item.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
