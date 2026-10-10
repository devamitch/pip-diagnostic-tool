'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import styles from './reportPage.module.css';
import Link from 'next/link';
import { Download } from 'lucide-react';

export default function ReportPage() {
	const params = useParams();
	const timestamp = Array.isArray(params.timestamp) ? params.timestamp[0] : params.timestamp;
	const { history, selectedTimeframe } = useEyeTrackingStore();

	// Find the report with the matching timestamp
	const report = history[selectedTimeframe]?.find(
		(item) => new Date(item.timestamp).getTime().toString() === timestamp
	);

	if (!report) {
		return (
			<div className={styles.container}>
				<h1>Report Not Found</h1>
				<p>The requested report could not be found.</p>
				<Link href="/history">Back to History</Link>
			</div>
		);
	}

	const getStatusColor = (strainText: string) => {
		switch (strainText) {
			case 'Low':
				return styles.normal;
			case 'Moderate':
				return styles.blinkrate;
			case 'High':
				return styles.eyestrain;
			default:
				return styles.normal;
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<Link href="/history" className={styles.backButton}>
					← Back to History
				</Link>
				<div className={styles.reportHeader}>
					<h1>Eye Scan Report</h1>
					<p>{new Date(report.timestamp).toLocaleString()}</p>
				</div>
			</div>

			<div className={styles.reportContent}>
				<div className={styles.statusSection}>
					<div>
						<h2>Overall Status</h2>
						<div className={`${styles.status} ${getStatusColor(report.strainText)}`}>
							{report.strainText === 'Low'
								? 'Normal'
								: report.strainText === 'Moderate'
									? 'Slightly Low Blink Rate'
									: 'Eye Strain Detected'}
						</div>
					</div>
					{/* <button className={styles.exportButton}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							className="lucide lucide-arrow-down-to-line-icon lucide-arrow-down-to-line"
						>
							<path d="M12 17V3" />
							<path d="m6 11 6 6 6-6" />
							<path d="M19 21H5" />
						</svg>
					</button> */}
				</div>

				<div className={styles.detailsGrid}>
					<div className={styles.detailCard}>
						<h3>Blink Rate</h3>
						<p className={styles.value}>{report.blinkRate} blinks/min</p>
						<p className={styles.label}>Normal range: 15-20 blinks/min</p>
					</div>

					<div className={styles.detailCard}>
						<h3>Eye Strain Level</h3>
						<p className={styles.value}>{report.strainText}</p>
					</div>

					<div className={styles.detailCard}>
						<h3>Tiredness Level</h3>
						<p className={styles.value}>{report.tiredText}</p>
					</div>

					<div className={styles.detailCard}>
						<h3>Attention Level</h3>
						<p className={styles.value}>{Math.round(report.attentionFrac * 100)}%</p>
					</div>

					<div className={styles.detailCard}>
						<h3>Eye Age</h3>
						<p className={styles.value}>{Math.round(report.eyeAge)} years</p>
					</div>

					<div className={styles.detailCard}>
						<h3>PERCLOSE</h3>
						<p className={styles.value}>{report.perClose.toFixed(1)}%</p>
						<p className={styles.label}>Percentage of eyelid closure</p>
					</div>
				</div>
			</div>
		</div>
	);
}
