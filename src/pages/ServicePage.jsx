import React, { useState } from 'react';
import { Search, MapPin, Star, Filter, Tractor, PhoneCall } from 'lucide-react';
import styles from './ServicePage.module.css';

const ServicePage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const services = [
        {
            id: 1,
            providerName: "Suresh Deshmukh",
            serviceName: "John Deere 5310 Tractor Rental",
            location: "Nashik, Maharashtra",
            price: "₹800 / hour",
            rating: 4.8,
            reviews: 24,
            image: "https://images.unsplash.com/photo-1595126730962-07e0c81afde6?auto=format&fit=crop&q=80&w=400",
            availability: "Available Today"
        },
        {
            id: 2,
            providerName: "Raju Patil",
            serviceName: "Drone Spraying Service",
            location: "Pune, Maharashtra",
            price: "₹400 / acre",
            rating: 4.9,
            reviews: 15,
            image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
            availability: "Available Tomorrow"
        },
        {
            id: 3,
            providerName: "AgriTech Solutions",
            serviceName: "Soil Testing & Consultation",
            location: "All Maharashtra",
            price: "₹1500 / test",
            rating: 4.7,
            reviews: 89,
            image: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&q=80&w=400",
            availability: "Booking Open"
        }
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1>Find Services</h1>
                    <p>Connect with top-rated agricultural service providers near you.</p>
                </div>
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Search for tractors, drones, labor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className={styles.filterBtn}>
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            <div className={styles.categories}>
                <button className={styles.categoryChip + ' ' + styles.activeChip}><Tractor size={16} /> Tractors</button>
                <button className={styles.categoryChip}>Drones</button>
                <button className={styles.categoryChip}>Harvesters</button>
                <button className={styles.categoryChip}>Consultation</button>
                <button className={styles.categoryChip}>Labor</button>
            </div>

            <div className={styles.serviceGrid}>
                {services.map(service => (
                    <div key={service.id} className={styles.serviceCard}>
                        <div className={styles.imgWrapper}>
                            <img src={service.image} alt={service.serviceName} />
                            <span className={styles.availabilityBadge}>{service.availability}</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.cardHeader}>
                                <h3>{service.serviceName}</h3>
                                <div className={styles.price}>{service.price}</div>
                            </div>
                            <p className={styles.providerName}>By {service.providerName}</p>

                            <div className={styles.metaData}>
                                <span className={styles.location}>
                                    <MapPin size={14} /> {service.location}
                                </span>
                                <span className={styles.rating}>
                                    <Star size={14} fill="#F59E0B" color="#F59E0B" /> {service.rating} ({service.reviews})
                                </span>
                            </div>

                            <button className={styles.contactBtn}>
                                <PhoneCall size={16} /> Contact Provider
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicePage;
