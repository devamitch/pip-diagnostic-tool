'use client'

import React, { useState } from 'react';
import styles from './AiScanSettings.module.css';
import { ChevronRight } from 'lucide-react'; 

function AiScanSettings() {
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
                <p>Auto-Save Scan History</p>
                <div
                    onClick={toggleAutoSave}
                    className={`${styles.toggle} ${autoSave ? styles.active : ''}`}
                >
                    <span className={`${styles.thumb} ${autoSave ? styles.thumbActive : ''}`} />
                </div>
            </div>

            <div className={styles.subSection}>
                <p>Auto-Share Scans</p>
                <div
                    onClick={toggleAutoShare}
                    className={`${styles.toggle} ${autoShare ? styles.active : ''}`}
                >
                    <span className={`${styles.thumb} ${autoShare ? styles.thumbActive : ''}`} />
                </div>
            </div>

            <button className={styles.button}>
                <p>Prediction Sensitivity</p>
                <ChevronRight size={21} /> 
            </button>
        </div>
    );
}

export default AiScanSettings;