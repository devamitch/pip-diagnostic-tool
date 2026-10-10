import Link from 'next/link';
import React from 'react';
import styles from './WorkCard.module.css'; 

function WorkCard() {
	return (
		<div className={styles.card}>
			<div className={styles.headerContainer}>
				<h2 className={styles.headerTitle}>Trust & Proof
</h2>
			</div>

			<div className={styles.grid}>
				<div className={styles.stepContainer}>
					<div className={styles.stepNumber}>1</div>
					<h3 className={styles.stepTitle}>Science-Driven Reliability</h3>
					<p className={styles.stepDescription}>
						Applies clinically validated eye strain indicators grounded in peer-reviewed research for accuracy and inclusivity.
					</p>
				</div>

				<div className={styles.stepContainer}>
					<div className={styles.stepNumber}>2</div>
					<h3 className={styles.stepTitle}>Built by Medical & AI Experts</h3>
					<p className={styles.stepDescription}>
						Developed by medical and AI/ML engineers with extensive experience in digital health and workplace wellness.
					</p>
				</div>

				<div className={styles.stepContainer}>
					<div className={styles.stepNumber}>3</div>
					<h3 className={styles.stepTitle}>Enterprise-Grade Privacy</h3>
					<p className={styles.stepDescription}>
						All eye data processed locally. No video or personal visuals stored or transmitted. Only encrypted, aggregated metrics shared.
					</p>
				</div>
			</div>

			<div className={styles.buttonContainer}>
				<Link href="/signin">
					<button className={styles.Signinbutton}>
						Start Your Eye Health Journey
					</button>
				</Link>
			</div>
		</div>
	);
}

export default WorkCard;
