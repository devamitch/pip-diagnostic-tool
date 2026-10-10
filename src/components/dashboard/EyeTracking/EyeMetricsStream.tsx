'use client';

import { EyeMetrics } from '@/hooks/useEyeTracking';
import React, { useEffect, useRef, useState } from 'react';
import styles from './EyeMetricsStream.module.css';

interface EyeMetricsStreamProps {
	metrics: EyeMetrics | null;
	streamData: EyeMetrics[];
	className?: string;
}

const EyeMetricsStream: React.FC<EyeMetricsStreamProps> = ({
	metrics,
	streamData,
	className = '',
}) => {
	const streamContainerRef = useRef<HTMLDivElement>(null);
	const [visibleMetrics, setVisibleMetrics] = useState<EyeMetrics[]>([]);

	useEffect(() => {
		if (streamData.length > 0) {
			setVisibleMetrics(streamData.slice(-10)); // Show last 10 data points

			// Auto-scroll to bottom
			if (streamContainerRef.current) {
				streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
			}
		}
	}, [streamData]);

	const getStatusClass = (value: number, type: string) => {
		switch (type) {
			case 'blinkRate':
				return value < 10 ? styles.high : value < 15 ? styles.moderate : styles.low;
			case 'perClose':
				return value > 40
					? styles.veryHigh
					: value > 20
						? styles.high
						: value > 5
							? styles.moderate
							: styles.low;
			default:
				return styles.normal;
		}
	};

	const MetricRow: React.FC<{ metric: EyeMetrics; index: number }> = ({ metric, index }) => (
		<div className={styles.streamRow} key={index}>
			<span className={styles.timestamp}>{metric.timestamp}</span>

			<div className={styles.metricGroup}>
				<span
					className={`${styles.metricValue} ${getStatusClass(metric.blinkRate, 'blinkRate')}`}
				>
					{metric.blinkRate.toFixed(1)}
					<span className={styles.metricLabel}>bpm</span>
				</span>

				<span
					className={`${styles.metricValue} ${getStatusClass(metric.perClose, 'perClose')}`}
				>
					{metric.perClose.toFixed(1)}%<span className={styles.metricLabel}>close</span>
				</span>

				<span
					className={`${styles.metricValue} ${styles[metric.strainText.toLowerCase()]}`}
				>
					{metric.strainText}
					<span className={styles.metricLabel}>strain</span>
				</span>
			</div>
		</div>
	);

	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.header}>
				<h3>Real-time Eye Metrics Stream</h3>
				<span className={styles.liveIndicator}>
					<span className={styles.liveDot}></span>
					LIVE
				</span>
			</div>

			<div className={styles.streamContainer} ref={streamContainerRef}>
				{visibleMetrics.length > 0 ? (
					visibleMetrics.map((metric, index) => (
						<MetricRow key={index} metric={metric} index={index} />
					))
				) : (
					<div className={styles.placeholder}>
						<p>No data yet. Start tracking to see real-time metrics.</p>
					</div>
				)}
			</div>

			{metrics && (
				<div className={styles.currentMetrics}>
					<div className={styles.currentHeader}>
						<span>Current Metrics</span>
						
					</div>

					<div className={styles.currentGrid}>
						<div className={styles.currentMetric}>
							<span className={styles.currentLabel}>Blink Rate</span>
							<span
								className={`${styles.currentValue} ${getStatusClass(metrics.blinkRate, 'blinkRate')}`}
							>
								{metrics.blinkRate.toFixed(1)} bpm
							</span>
						</div>

						<div className={styles.currentMetric}>
							<span className={styles.currentLabel}>Eye Closure</span>
							<span
								className={`${styles.currentValue} ${getStatusClass(metrics.perClose, 'perClose')}`}
							>
								{metrics.perClose.toFixed(1)}%
							</span>
						</div>

						<div className={styles.currentMetric}>
							<span className={styles.currentLabel}>Strain Level</span>
							<span
								className={`${styles.currentValue} ${styles[metrics.strainText.toLowerCase()]}`}
							>
								{metrics.strainText}
							</span>
						</div>

						<div className={styles.currentMetric}>
							<span className={styles.currentLabel}>Attention</span>
							<span
								className={`${styles.currentValue} ${metrics.attBinary ? styles.good : styles.poor}`}
							>
								{metrics.attBinary ? 'Good' : 'Poor'}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EyeMetricsStream;
