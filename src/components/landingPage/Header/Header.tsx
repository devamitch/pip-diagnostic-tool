import styles from './Header.module.css';
import React from 'react';
import Link from 'next/link';

function Header() {
	return (
		<header className={styles.header}>
			<span className={styles.logoText}>Rescue Eyes</span>

			<div className={styles.navLinks}>
				<Link href="/signin">
					<button className={styles.signInButton}>Sign In</button>
				</Link>
				<Link href="/register">
					<button className={styles.startButton}>Get Started</button>
				</Link>
			</div>
		</header>
	);
}

export default Header;
