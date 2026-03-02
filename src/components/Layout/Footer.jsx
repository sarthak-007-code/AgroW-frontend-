import React from 'react';
import { Leaf, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>

                {/* Top Section */}
                <div className={styles.topSection}>

                    {/* Brand Column */}
                    <div className={styles.brandCol}>
                        <div className={styles.logo}>
                            <Leaf size={24} fill="currentColor" /> {t.navbar.siteName}
                        </div>
                        <p className={styles.tagline}>{t.footer.tagline}</p>
                        <div className={styles.madeWith}>
                            <Heart size={16} fill="currentColor" /> {t.footer.madewith}
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div className={styles.linkCol}>
                        <h4 className={styles.colTitle}>{t.footer.links.platform.title}</h4>
                        <ul className={styles.linkList}>
                            {t.footer.links.platform.items.map((item, i) => (
                                <li key={i} className={styles.linkItem}><a href="#">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className={styles.linkCol}>
                        <h4 className={styles.colTitle}>{t.footer.links.resources.title}</h4>
                        <ul className={styles.linkList}>
                            {t.footer.links.resources.items.map((item, i) => (
                                <li key={i} className={styles.linkItem}><a href="#">{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Languages */}
                    <div className={styles.linkCol}>
                        <h4 className={styles.colTitle}>{t.footer.links.contact.title}</h4>
                        <ul className={styles.linkList}>
                            <li className={styles.contactItem}><Phone size={16} /> {t.footer.links.contact.phone}</li>
                            <li className={styles.contactItem}><Mail size={16} /> {t.footer.links.contact.email}</li>
                            <li className={styles.contactItem}><MapPin size={16} /> {t.footer.links.contact.address}</li>
                        </ul>

                        <div className={styles.langSection}>
                            <h4 className={styles.colTitle}>{t.footer.languages.title}</h4>
                            <div className={styles.langList}>
                                {t.footer.languages.list.map((lang, i) => (
                                    <span key={i} className={styles.langTag}>{lang}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className={styles.bottomBar}>
                    <p>{t.footer.copyright}</p>
                    <div className={styles.legalLinks}>
                        {t.footer.bottomConfig.map((link, i) => (
                            <a href="#" key={i}>{link}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
