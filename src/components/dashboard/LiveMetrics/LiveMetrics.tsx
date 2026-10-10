'use client';

import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { Activity, Clock, Eye, Monitor, Target, Zap } from 'lucide-react';
import React from 'react';
import styles from './LiveMetrics.module.css';
import { useDashboardStore } from '@/store/dashboard-store';

const LiveMetrics: React.FC = () => {
	const { currentMetrics, sessionStartTime, profile } = useEyeTrackingStore();
	const isTracking = useDashboardStore((state) => state.isTrackingActive);

	const sessionDuration = React.useMemo(() => {
		if (!sessionStartTime) return 0;
		return Math.floor((Date.now() - new Date(sessionStartTime).getTime()) / 1000);
	}, [sessionStartTime]);

	const formatDuration = (seconds: number) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hrs > 0) {
			return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	// Calculate eye age with strain factor
	const calculatedEyeAge = React.useMemo(() => {
		const strainFactor = currentMetrics.eyeStrain / 100;
		const tirednessFactor = currentMetrics.tiredness / 100;
		const agingFactor = (strainFactor + tirednessFactor) / 2;
		return Math.round(profile.age + agingFactor * 10);
	}, [profile.age, currentMetrics.eyeStrain, currentMetrics.tiredness]);

	const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
		if (value <= thresholds.good) return '#10b981'; // green
		if (value <= thresholds.warning) return '#f59e0b'; // yellow
		return '#ef4444'; // red
	};

	const getAttentionColor = (value: number) => {
		if (value >= 80) return '#10b981'; // green
		if (value >= 60) return '#f59e0b'; // yellow
		return '#ef4444'; // red
	};

	console.log('[LiveMetrics] Rendering with metrics:', {
		blinkRate: currentMetrics.blinkRate,
		eyeStrain: currentMetrics.eyeStrain,
		attentionLevel: currentMetrics.attentionLevel,
		tiredness: currentMetrics.tiredness,
		facePresent: currentMetrics.facePresent,
		isTracking,
	});

	if (!isTracking) {
		return (
			<div className={styles.container}>
				<div className={styles.inactiveState}>
					<Target size={48} className={styles.inactiveIcon} />
					<h3>Eye Tracking Inactive</h3>
					<p>Start tracking to see live metrics</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.statusIndicator}>
					<div className={`${styles.statusDot} ${isTracking ? styles.active : ''}`} />
					<span className={styles.statusText}>
						{isTracking ? 'Tracking Active' : 'Inactive'}
					</span>
				</div>
				<div className={styles.sessionTime}>
					<Clock size={16} />
					<span>{formatDuration(sessionDuration)}</span>
				</div>
			</div>

			<div className={styles.metricsGrid}>
				{/* Blink Rate */}
				<div className={styles.metricCard}>
					<div className={styles.metricHeader}>
						<Eye size={20} />
						<span className={styles.metricLabel}>Blink Rate</span>
					</div>
					<div className={styles.metricValue}>
						<span
							className={styles.valueNumber}
							style={{
								color: getStatusColor(currentMetrics.blinkRate, {
									good: 20,
									warning: 30,
								}),
							}}
						>
							{currentMetrics.blinkRate.toFixed(1)}
						</span>
						<span className={styles.valueUnit}>bpm</span>
					</div>
					<div className={styles.metricStatus}>Normal: 15-20 bpm</div>
				</div>

				{/* Eye Strain */}
				<div className={styles.metricCard}>
					<div className={styles.metricHeader}>
						<Activity size={20} />
						<span className={styles.metricLabel}>Eye Strain</span>
					</div>
					<div className={styles.metricValue}>
						<span
							className={styles.valueNumber}
							style={{
								color: getStatusColor(currentMetrics.eyeStrain, {
									good: 30,
									warning: 60,
								}),
							}}
						>
							{Math.round(currentMetrics.eyeStrain)}
						</span>
						<span className={styles.valueUnit}>%</span>
					</div>
					<div className={styles.metricStatus}>{currentMetrics.strainText} Strain</div>
				</div>

				{/* Attention Level */}
				<div className={styles.metricCard}>
					<div className={styles.metricHeader}>
						<Target size={20} />
						<span className={styles.metricLabel}>Attention</span>
					</div>
					<div className={styles.metricValue}>
						<span
							className={styles.valueNumber}
							style={{ color: getAttentionColor(currentMetrics.attentionLevel) }}
						>
							{Math.round(currentMetrics.attentionLevel)}
						</span>
						<span className={styles.valueUnit}>%</span>
					</div>
					<div className={styles.metricStatus}>
						{currentMetrics.facePresent ? 'Face Detected' : 'No Face'}
					</div>
				</div>

				{/* Tiredness */}
				<div className={styles.metricCard}>
					<div className={styles.metricHeader}>
						<Zap size={20} />
						<span className={styles.metricLabel}>Tiredness</span>
					</div>
					<div className={styles.metricValue}>
						<span
							className={styles.valueNumber}
							style={{
								color: getStatusColor(currentMetrics.tiredness, {
									good: 25,
									warning: 50,
								}),
							}}
						>
							{Math.round(currentMetrics.tiredness)}
						</span>
						<span className={styles.valueUnit}>%</span>
					</div>
					<div className={styles.metricStatus}>{currentMetrics.tiredText} Level</div>
				</div>

				{/* PERCLOS */}
				<div className={styles.metricCard}>
					<div className={styles.metricHeader}>
						<Monitor size={20} />
						<span className={styles.metricLabel}>PERCLOS</span>
					</div>
					<div className={styles.metricValue}>
						<span
							className={styles.valueNumber}
							style={{
								color: getStatusColor(currentMetrics.perclos, {
									good: 5,
									warning: 20,
								}),
							}}
						>
							{currentMetrics.perclos.toFixed(2)}
						</span>
						<span className={styles.valueUnit}>%</span>
					</div>
					<div className={styles.metricStatus}>Eyes Closed Time</div>
				</div>

				{/* Eye Age */}
				<div className={styles.metricCard}>
					<div className={styles.metricHeader}>
						<Clock size={20} />
						<span className={styles.metricLabel}>Eye Age</span>
					</div>
					<div className={styles.metricValue}>
						<span
							className={styles.valueNumber}
							style={{
								color: calculatedEyeAge > profile.age + 5 ? '#ef4444' : '#10b981',
							}}
						>
							{calculatedEyeAge}
						</span>
						<span className={styles.valueUnit}>years</span>
					</div>
					<div className={styles.metricStatus}>Actual: {profile.age} years</div>
				</div>
			</div>

			<div className={styles.footer}>
				<div className={styles.updateInfo}>
					Last updated: {new Date(currentMetrics.timestamp).toLocaleTimeString()}
				</div>
			</div>
		</div>
	);
};

export default LiveMetrics;
