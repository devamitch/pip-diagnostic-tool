'use client';
import React, { useState } from 'react';
import styles from './notifications.module.css';

function Notifications() {
    const [autoSave, setAutoSave] = useState(true);
    const [autoShare, setAutoShare] = useState(false);

    const toggleAutoSave = () => {
        setAutoSave(!autoSave);
    };

    const toggleAutoShare = () => {
        setAutoShare(!autoShare);
    };

    return (
        <div className={styles.section}>
            <div className={styles.subSection}>
                <p>Health Scan Report</p>
                <div
                    onClick={toggleAutoSave}
                    className={`${styles.toggle} ${autoSave ? styles.active : ''}`}
                >
                    <span className={`${styles.thumb} ${autoSave ? styles.thumbActive : ''}`} />
                </div>
            </div>
            <div className={styles.subSection}>
                <p>New Product & Articles</p>
                <div
                    onClick={toggleAutoShare}
                    className={`${styles.toggle} ${autoShare ? styles.active : ''}`}
                >
                    <span className={`${styles.thumb} ${autoShare ? styles.thumbActive : ''}`} />
                </div>
            </div>
        </div>
    );
}

export default Notifications;