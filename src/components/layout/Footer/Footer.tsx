'use client';

import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.copyright}>
				@{new Date().getUTCFullYear()}, Made with care by AuraCore
			</div>

			<div className={styles.section}>
				<Link href="/terms" className={styles.link}>
					Terms & Conditions
				</Link>
				<Link href="/privacy" className={styles.link}>
					Privacy Policy
				</Link>
				<Link href="/cookies" className={styles.link}>
					Cookies Policy
				</Link>
			</div>
		</footer>
	);
}
