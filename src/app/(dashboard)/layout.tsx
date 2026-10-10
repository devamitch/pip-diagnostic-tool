'use client';
import Footer from '@/components/layout/Footer/Footer';
import Navbar from '@/components/layout/Navbar/Navbar';
import PictureInMode from '@/components/layout/PictureInMode/PictureInMode';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { EyeTrackingProvider } from '@/provider/EyeTrackingProvider';
import { PiPProvider } from '@/provider/PiPContext';
import { useDashboardStore } from '@/store/dashboard-store';
import { useEffect } from 'react';
import styles from './layout.module.scss';

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { startScreenTime, resetDailyScreenTime } = useDashboardStore();

	useEffect(() => {
		startScreenTime();

		return () => {
			resetDailyScreenTime();
		};
	}, [startScreenTime, resetDailyScreenTime]);

	useEffect(() => {
		// Register service worker
		if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
			navigator.serviceWorker
				.register('/sw.js', { scope: '/' })
				.then((registration) => {
					console.log('SW registered: ', registration);
				})
				.catch((registrationError) => {
					console.log('SW registration failed: ', registrationError);
				});
		}

		// Handle online/offline events
		const handleOnline = () => {
			console.log('App is online');
		};

		const handleOffline = () => {
			console.log('App is offline');
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	return (
		<EyeTrackingProvider>
			<PiPProvider>
				<div className={styles.container}>
					<Sidebar />
					<div className={styles.content}>
						<Navbar />
						<main className={styles.main}>
							{children}
							<PictureInMode />
						</main>
						<Footer />
					</div>
				</div>
			</PiPProvider>
		</EyeTrackingProvider>
	);
}
