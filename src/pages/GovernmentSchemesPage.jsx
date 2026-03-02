import React, { useState } from 'react';
import styles from './GovernmentSchemesPage.module.css';
import schemesData from '../../governmentSchemes.json';
import { Search, ChevronDown, ChevronUp, FileText, CheckCircle, ChevronRight, BookOpen } from 'lucide-react';

const GovernmentSchemesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedScheme, setExpandedScheme] = useState(null);

    // Extract unique categories
    const categories = ['All', ...new Set(schemesData.map(s => s.category))];

    // Filter schemes based on search and selected category
    const filteredSchemes = schemesData.filter(scheme => {
        const matchesSearch = scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scheme.core_benefit_provided.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || scheme.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleExpand = (id) => {
        if (expandedScheme === id) {
            setExpandedScheme(null);
        } else {
            setExpandedScheme(id);
        }
    };

    return (
        <div className={styles.schemesContainer}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleWrapper}>
                        <BookOpen className={styles.headerIcon} />
                        <h1>Government Schemes</h1>
                    </div>
                    <p className={styles.subtitle}>Discover and access agricultural schemes designed to support your farming journey.</p>
                </div>
            </div>

            <div className={styles.filterSection}>
                <div className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search for schemes, benefits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.categoryFilters}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.activeCategory : ''}`}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.schemesGrid}>
                {filteredSchemes.length > 0 ? (
                    filteredSchemes.map((scheme) => (
                        <div key={scheme.id} className={`${styles.schemeCard} ${expandedScheme === scheme.id ? styles.expanded : ''}`}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <span className={styles.badge}>{scheme.category.replace('_', ' ')}</span>
                                    <span className={`${styles.badge} ${styles.levelBadge}`}>{scheme.level}</span>
                                </div>
                                <h3>{scheme.name}</h3>
                            </div>

                            <div className={styles.cardBody}>
                                <div className={styles.benefitBox}>
                                    <strong>Core Benefit:</strong>
                                    <p>{scheme.core_benefit_provided}</p>
                                </div>
                                <div className={styles.demographicText}>
                                    <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                    <strong>Target:</strong> {scheme.target_demographic}
                                </div>
                            </div>

                            {expandedScheme === scheme.id && (
                                <div className={styles.cardExpandedContent}>
                                    <div className={styles.expandedSection}>
                                        <h4><CheckCircle size={16} /> Eligibility</h4>
                                        <p>{scheme.eligibility_criteria}</p>
                                    </div>
                                    <div className={styles.expandedSection}>
                                        <h4><FileText size={16} /> Application Procedure</h4>
                                        <p>{scheme.application_procedure}</p>
                                    </div>
                                    <div className={styles.expandedSection}>
                                        <h4>Impact</h4>
                                        <p>{scheme.strategic_impact_on_farmers}</p>
                                    </div>
                                </div>
                            )}

                            <button
                                className={styles.expandBtn}
                                onClick={() => toggleExpand(scheme.id)}
                            >
                                {expandedScheme === scheme.id ? (
                                    <>Show Less <ChevronUp size={16} /></>
                                ) : (
                                    <>Read More <ChevronDown size={16} /></>
                                )}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className={styles.noResults}>
                        <p>No schemes found matching your criteria.</p>
                        <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}>Clear Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Users icon locally since we didn't import it at the top
const Users = ({ size, style }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export default GovernmentSchemesPage;
