'use client';
import ReportCard from '@/components/dashboard/ReportCard/ReportCard';
import ReportHistory from '@/components/history/reportHistory/reportHistory';
import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import Link from 'next/link';
import styles from './history.module.scss';

export default function HistoryPage() {
	const { selectedDate } = useEyeTrackingStore();

	return (
		<div className={styles.container}>
			<div className={styles.leftcontainer}>
				<div className={styles.header}>
					<h1>History & Reports</h1>
					<p>Review your scan and manage your eyes health records</p>
					<p style={{ color: '#7baf7b', fontSize: '14px', margin: '8px 0 0 0' }}>
						Viewing data for:{' '}
						{selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Today'}
					</p>
				</div>
				<ReportHistory />
			</div>

			<div className={styles.rightcontainer}>
				<ReportCard />
				<div className={styles.panel}>
					<h2>Eye Care Report</h2>
					<Link href="/history" className={styles.Historysection}>
						<p className={styles.title}>Monthly Eye Health Report</p>
						<p className={styles.description}>April 16</p>
					</Link>
					<Link href="/history" className={styles.Historysection}>
						<p className={styles.title}>Annual Eye Health Report</p>
						<p className={styles.description}>January 15</p>
					</Link>
					<span className={styles.footer}>
						<p>All records are securely encrypted</p>
						<button className={styles.exportButton}>Export all Data</button>
					</span>
				</div>
			</div>
		</div>
	);
}
