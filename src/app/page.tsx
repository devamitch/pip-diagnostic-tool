import Image from 'next/image';
import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/landingPage/Header/Header';
import Hero from '@/components/landingPage/Hero/Hero';
import FeatureCards from '@/components/landingPage/FeatureCards/FeatureCards';
import WorkCard from '@/components/landingPage/WorkCard/WorkCard';
import styles from './Home.module.css';
import {
    afterRescueEyes,
    beforeRescueEyes,
    benefitsOrganisationData,
    businessFeatures,
    featureData,
    impactPoints,
    problemPoints,
    whoWeWorkWithData
} from '@/data';

export default function Home() {

    return (
        <div className={styles.container}>
            <Header />
            <main className={styles.mainContent}>
                <Hero />

                {/*  Why Eye Health Matters */}
                <section className={styles.featuresSection}>
                    <div className={styles.twoColumnLayout}>
                        <Image
                            src="/hero2Image.png"
                            alt="A person working comfortably at a well-lit desk"
                            width={500}
                            height={500}
                            className={styles.layoutImage}
                        />
                        <div className={styles.layoutContent}>
                            <h2 className={styles.sectionTitle}>Why Eye Health Matters at Work</h2>
                            <div className={styles.infoCard}>
                                <h3 className={styles.subHeading}>The Problem</h3>
                                <ul className={styles.checkList}>
                                    {problemPoints.map((point, index) => (
                                        <li key={index} className={styles.checkListItem}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.infoCard}>
                                <h3 className={styles.subHeading}>The Impact</h3>
                                <ul className={styles.checkList}>
                                    {impactPoints.map((point, index) => (
                                        <li key={index} className={styles.checkListItem}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/*  What Rescue Eyes Does */}
                <section id="features" className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>What Rescue Eyes Does</h2>
                    <FeatureCards features={featureData} />
                </section>

                {/*  Benefits for Organizations */}
                <section id="organisation-benefits" className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Benefits for Organizations</h2>
                    <FeatureCards features={benefitsOrganisationData} />
                </section>

                {/*  Built for Business */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Built for Business</h2>
                    <div className={styles.twoColumnLayout}>
                        <Image
                            src="/hero3Image.png"
                            alt="Desktop computer showing an analytics dashboard"
                            width={500}
                            height={500}
                            className={styles.layoutImage}
                        />
                        <div className={styles.layoutContent}>
                            {businessFeatures.map((feature, index) => (
                                <div key={index}>
                                    <h3 className={styles.subHeading}>{feature.title}</h3>
                                    <p className={styles.sectionDescription}>{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/*  Who We Work With */}
                <section id="who-we-work-with" className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Who We Work With</h2>
                    <FeatureCards features={whoWeWorkWithData} />
                </section>

                {/*  Corporate Wellness ROI */}
                <section className={styles.featuresSection}>
                    <h2 className={styles.sectionTitle}>Corporate Wellness ROI</h2>
                    <div className={styles.twoColumnLayout}>
                        <div className={styles.infoCard}>
                            <h3 className={styles.subHeading}>Before Rescue Eyes:</h3>
                            <ul className={styles.checkList}>
                                {beforeRescueEyes.map((point, index) => (
                                    <li key={index} className={styles.checkListItem}>{point}</li>
                                ))}
                            </ul>
                        </div>
                        <div className={styles.infoCard}>
                            <h3 className={styles.subHeading}>After Rescue Eyes:</h3>
                            <ul className={styles.checkList}>
                                {afterRescueEyes.map((point, index) => (
                                    <li key={index} className={styles.checkListItem}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/*  How It Works */}
                <section id="trust-proof" className={styles.WorksSection}>
                    <WorkCard />
                </section>
            </main>
            <Footer />
        </div>
    );
}