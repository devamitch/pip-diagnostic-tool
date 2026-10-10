'use client';

import ArticleCard from '@/components/dashboard/ArticleCard/ArticleCard';
import EyeMetricsDisplay from '@/components/dashboard/EyeTracking/EyeMetricDisplay/EyeMetricsDisplay';
import ReportHistory from '@/components/dashboard/ReportHistory/ReportHistory';
import { articlesData } from '@/data';
import { useEyeTrackingContext } from '@/provider/EyeTrackingProvider';
import { useCallback } from 'react';
import styles from './dashboard.module.scss';

export default function DashboardPage() {
	const { metrics, error, isActive, streamData, startTracking, stopTracking } =
		useEyeTrackingContext();

	const handleToggleTracking = useCallback(async () => {
		if (isActive) {
			stopTracking();
		} else {
			try {
				await startTracking();
			} catch (err) {
				console.error('Failed to start tracking:', err);
			}
		}
	}, [isActive, startTracking, stopTracking]);

	return (
		<div className={styles.container}>
			<h2 className={styles.sectionHeading}>Eye Health Dashboard</h2>

			{error && (
				<div className={styles.errorBanner}>
					<span>Error: {error}</span>
					<button onClick={handleToggleTracking} className={styles.retryButton}>
						Retry
					</button>
				</div>
			)}

			<div className={styles.streamSection}>
				{metrics && (
					<EyeMetricsDisplay
						metrics={metrics}
						className={styles.metricsPanel}
						faceAge={metrics?.faceAge}
						eyeAge={metrics?.eyeAge}
					/>
				)}
				{/* <EyeMetricsStream metrics={metrics} streamData={streamData} /> */}
			</div>

			<ReportHistory />

			<h2 className={styles.sectionHeading}>Articles</h2>
			<div className={styles.articlesSection}>
				{articlesData.map((article) => (
					<ArticleCard
						key={article.title}
						title={article.title}
						description={article.description}
						image={article.image}
					/>
				))}
			</div>
		</div>
	);
}
