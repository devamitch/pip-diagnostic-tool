'use client'

import { ChevronRight, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase';
import styles from './SettingsPage.module.css';
import AiScanSettings from '@/components/settings/aiScanSettings/AiScanSettings';
import Notifications from '@/components/settings/notifications/notifications';

export default function SettingsPage() {

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out: ', error);
        }
    };

    return (
        <div className={styles.container}>
            <>
                <h3 className={styles.sectionHeading}>Account Settings</h3>
                <div className={styles.section}>
                    <button className={styles.button}>
                        <span>profile Information</span>
                        <ChevronRight size={21} />
                    </button>
                    <button className={styles.button}>
                        <span>Change Password</span>
                        <ChevronRight size={21} />
                    </button>
                </div>
            </>

            <>
                <h3 className={styles.sectionHeading}>AI Scan Settings</h3>
                <AiScanSettings />
            </>

            <>
                <h3 className={styles.sectionHeading}>Discovery Preferences</h3>
                <div className={styles.section}>
                    <button className={styles.button}>
                        <span>Specialist Region</span>
                        <ChevronRight size={21} />
                    </button>
                    <button className={styles.button}>
                        <span>Product Categories</span>
                        <ChevronRight size={21} />
                    </button>
                </div>
            </>

            <>
                <h3 className={styles.sectionHeading}>Notification</h3>
                <Notifications />
            </>

            <>
                <h3 className={styles.sectionHeading}>Privacy & Data</h3>
                <div className={styles.section}>
                    <button className={styles.button}>
                        <span>App Permission</span>
                        <ChevronRight size={21} />
                    </button>
                    <button className={styles.button}>
                        <span>Download My Data</span>
                        <ChevronRight size={21} />
                    </button>
                    <button className={styles.button}>
                        <p>Delete My Data</p>
                        <ChevronRight size={21} />
                    </button>
                </div>
            </>

            <>
                <h3 className={styles.sectionHeading}>Help & Support</h3>
                <div className={styles.section}>
                    <button className={styles.button}>
                        <span>FAQ</span>
                        <ChevronRight size={21} />
                    </button>
                    <button className={styles.button}>
                        <span>Contact Us</span>
                        <ChevronRight size={21} />
                    </button>
                    <button className={styles.button}>
                        <p>Term & privacy Policy</p>
                        <ChevronRight size={21} />
                    </button>
                </div>
            </>

            <>
                <div className={styles.section}>
                    <button onClick={handleLogout} className={styles.Logoutbutton}>
                        <LogOut size={21} />
                        Log Out
                    </button>
                </div>
            </>
        </div>
    );
}
