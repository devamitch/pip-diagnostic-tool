import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import styles from './Hero.module.css';
import Image from 'next/image';

function Hero() {
    return (
        <section className={styles.heroSection}>
            <div className={styles.content}>
                <p className={styles.heading}>
                    Rescue Eyes: 
{' '}
                    <span className={styles.highlight}>See Better. Work Smarter.</span>
                </p>
                <p className={styles.subheading}>
                    AI-powered eye wellness that keeps your team healthy, focused, and performing at their best.

                </p>
                <div className={styles.buttonGroup}>
                    <Link href="/signin" className={styles.btnsignin}>
                        
                            <p>Get Started</p>
                            <ArrowRight className={styles.btnIcon} />
                    </Link>
                    <Link href="#how-it-works" className={styles.btnWork}>
                            Learn More
                    </Link>
                </div>
            </div>
            <Image
                                src="/hero1Image.png"
                                alt="landing page hero image"
                                width={500}
                                height={500}
                                className={styles.image}
                            />
            {/* <div className={`${styles.graphicContainer} ${styles.fadeIn}`}>
                <div className={styles.eyeContainer}>
                    
                    <div className={styles.eyeGraphic}>
                        <div className={styles.pupil}></div>
                    </div>
                </div>
            </div> */}
        </section>
    );
}

export default Hero;