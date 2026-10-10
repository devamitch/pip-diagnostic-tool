'use client';

import CamScreen from '@/components/dashboard/EyeTracking/CamScreen';
import EyeMetricsStream from '@/components/dashboard/EyeTracking/EyeMetricsStream';
import BlinkRateCard from '@/components/dashboard/MetricCards/BlinkRateCard';
import EyeAgeCard from '@/components/dashboard/MetricCards/EyeAgeCard';
import EyeStrainCard from '@/components/dashboard/MetricCards/EyeStrainCard';
import ScreenTimeCard from '@/components/dashboard/MetricCards/ScreenTimeCard';
import { EyeMetrics } from '@/hooks/useEyeTracking';
import { useEyeTrackingContext } from '@/provider/EyeTrackingProvider';
import { useDashboardStore } from '@/store/dashboard-store';
import { MetricsCardData } from '@/types';
import { Clock, Eye, EyeOff, View } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import styles from './livepage.module.css';

const formatDuration = (seconds: number): string => {
	if (seconds === 0) return '0m';

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0) {
		return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
	}
	return `${minutes}m`;
};

const LiveDashboard = () => {
	const {
		videoRef,
		canvasRef,
		metrics,
		loading,
		error,
		isActive,
		cameraReady,
		streamData,
		startTracking,
		stopTracking,
		getMetricsHistory,
	} = useEyeTrackingContext();

	const { dailyScreenTime } = useDashboardStore();

	const metricsHistory = useMemo(() => getMetricsHistory() || [], [getMetricsHistory]);

	const generateChartData = useCallback((history: EyeMetrics[], key: keyof EyeMetrics) => {
		return history?.map?.((metric, index) => ({
			v: Number(metric[key]) || 0,
			high: Number(metric[key]) > (key === 'blinkRate' ? 15 : 50),
		}));
	}, []);

	const metricsData: MetricsCardData[] = useMemo(
		() => [
			{
				name: 'Blink Rate',
				value: metrics?.blinkRate?.toFixed(1) || '0',
				unit: '/min',
				icon: <EyeOff />,
				graphData: generateChartData(metricsHistory, 'blinkRate'),
				status: metrics?.strainText.toLowerCase() || 'low',
			},
			{
				name: 'Eye Strain',
				value: metrics?.strainLevelIdx ?? 0,
				unit: 'Level',
				icon: <Eye />,
				graphData: generateChartData(metricsHistory, 'strainLevelIdx'),
				status: metrics?.strainText.toLowerCase() || 'low',
			},
			{
				name: 'Eye Age',
				value: metrics?.eyeAge || 'N/A',
				unit: 'years',
				icon: <View />,
				graphData: generateChartData(metricsHistory, 'perClose'),
				status: metrics?.tiredText.toLowerCase().replace(' ', '-') || 'low',
			},
			{
				name: 'Screen Time',
				value: dailyScreenTime ? formatDuration(dailyScreenTime) : '0m',
				icon: <Clock />,
				graphData: Array(10)
					.fill(0)
					.map((_, i) => ({
						v: i < 9 ? Math.random() * 20 : dailyScreenTime / 60,
						high: i < 9 ? Math.random() * 20 > 15 : dailyScreenTime / 60 > 180,
					})),
				status: dailyScreenTime > 180 * 60 ? 'high' : 'low',
			},
		],
		[metrics, metricsHistory, generateChartData, dailyScreenTime]
	);

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

	// useEffect(() => {
	// 	return () => {
	// 		stopTracking({ preserveIntent: true });
	// 	};
	// }, [stopTracking]);

	return (
		<div className={styles.container}>
			{error && (
				<div className={styles.errorBanner}>
					<span>Error: {error}</span>
					<button onClick={handleToggleTracking} className={styles.retryButton}>
						Retry
					</button>
				</div>
			)}

			<div className={styles.mainSection}>
				<div className={styles.leftMetrics}>
					<BlinkRateCard data={metricsData[0]} metrics={metrics} />
					<EyeAgeCard
						data={metricsData[2]}
						metrics={metrics}
						faceAge={metrics?.faceAge}
					/>
				</div>

				<div className={styles.cameraSection}>
					<CamScreen
						oldVideoRef={videoRef}
						oldCanvasRef={canvasRef}
						showOverlay={isActive}
						loading={loading}
						error={error}
						isActive={isActive}
						cameraReady={cameraReady}
						onToggleTracking={handleToggleTracking}
					/>
				</div>

				<div className={styles.rightMetrics}>
					<EyeStrainCard data={metricsData[1]} metrics={metrics} />

					<ScreenTimeCard data={metricsData[3]} metrics={metrics} />
				</div>
			</div>
			<div className={styles.streamSection}>
				<EyeMetricsStream metrics={metrics} streamData={streamData} />
			</div>
		</div>
	);
};

export default LiveDashboard;
