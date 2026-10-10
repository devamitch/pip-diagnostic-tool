'use client';

import ReportCard from '@/components/dashboard/ReportCard/ReportCard';
import { EyeMetrics } from '@/hooks/useEyeTracking';
import {
	Activity,
	AlertTriangle,
	Battery,
	Brain,
	Clock,
	Eye,
	Target,
	User,
	Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import styles from './EyeMetricsDisplay.module.css';

interface EyeMetricsDisplayProps {
	metrics: EyeMetrics;
	className?: string;
	faceAge?: number;
	eyeAge?: number;
}

const EyeMetricsDisplay: React.FC<EyeMetricsDisplayProps> = ({
	metrics,
	className = '',
	faceAge,
	eyeAge,
}) => {
	const [displayMetrics, setDisplayMetrics] = useState(metrics);
	const [hasNewData, setHasNewData] = useState(false);

	useEffect(() => {
		if (metrics.timestamp !== displayMetrics.timestamp) {
			setHasNewData(true);
			setDisplayMetrics(metrics);

			const timer = setTimeout(() => {
				setHasNewData(false);
			}, 1000);

			return () => clearTimeout(timer);
		}
	}, [metrics, displayMetrics.timestamp]);

	const getStatus = (value: number, type: string) => {
		switch (type) {
			case 'blinkRate':
				return value < 10 ? 'high' : value < 15 ? 'moderate' : 'low';
			case 'perClose':
				return value > 40
					? 'very-high'
					: value > 20
						? 'high'
						: value > 5
							? 'moderate'
							: 'low';
			case 'strain':
				return metrics.strainText.toLowerCase();
			case 'tiredness':
				return metrics.tiredText.toLowerCase().replace(' ', '-');
			default:
				return 'low';
		}
	};

	const MetricCard: React.FC<{
		icon: React.ReactNode;
		label: string;
		value: string | number;
		recommendedValue: string;
		status?: string;
		isNew?: boolean;
	}> = ({ icon, label, value, recommendedValue, status, isNew }) => (
		<div className={`${styles.metricCard} `}>
			<div className={styles.cardIcon}>{icon}</div>
			<div className={styles.cardContent}>
				<div className={styles.metricHeader}>
					<span className={styles.metricLabel}>{label}</span>
					<span className={styles.recommendedValue}>{recommendedValue}</span>
				</div>
				<div className={styles.metricValue} data-status={status}>
					{value}
				</div>
			</div>
		</div>
	);

	const leftMetrics = [
		{
			icon: <Eye size={36} />,
			label: 'Blink Rate',
			value: displayMetrics.blinkRate.toFixed(1),
			recommendedValue: '15-20 blinks/min',
			status: getStatus(displayMetrics.blinkRate, 'blinkRate'),
		},
		{
			icon: <Activity size={36} />,
			label: 'Eye Closure',
			value: `${displayMetrics.perClose.toFixed(1)} %`,
			recommendedValue: '< 5%',
			status: getStatus(displayMetrics.perClose, 'perClose'),
		},
		{
			icon: <AlertTriangle size={36} />,
			label: 'Eye Strain',
			value: displayMetrics.strainText,
			recommendedValue: 'Low',
			status: getStatus(0, 'strain'),
		},
		{
			icon: <Battery size={36} />,
			label: 'Tiredness',
			value: displayMetrics.tiredText,
			recommendedValue: 'Low',
			status: getStatus(0, 'tiredness'),
		},
		{
			icon: <Brain size={36} />,
			label: 'Attention Level',
			value: `${(displayMetrics.attentionFrac * 100).toFixed(1)} %`,
			recommendedValue: '> 80%',
			status: displayMetrics.attBinary ? 'low' : 'high',
		},
	];

	const rightMetrics = [
		{
			icon: <User size={36} />,
			label: 'Eye Age',
			value: eyeAge ? `${eyeAge} Years` : displayMetrics.eyeAge,
			recommendedValue: 'Equal to real age',
			status: 'low',
		},
		{
			icon: <Clock size={36} />,
			label: 'Face Age',
			value: faceAge ? `${faceAge} Years` : '0',
			recommendedValue: '25-35 years',
		},
		{
			icon: <Target size={36} />,
			label: 'Eye Aspect Ratio',
			value: displayMetrics.eyeAspectRatio.toFixed(3),
			recommendedValue: '2.5-4.0',
		},
		{
			icon: <Activity size={36} />,
			label: 'Pupil Dilation',
			value: displayMetrics.pupilDilation.toFixed(1),
			recommendedValue: '2-8 mm',
		},
		{
			icon: <Zap size={36} />,
			label: 'Squint Intensity',
			value: `${displayMetrics.squintIntensity.toFixed(1)} %`,
			recommendedValue: '< 10%',
		},
	];

	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.metricsLayout}>
				<div className={styles.leftMetrics}>
					{leftMetrics.map((metric, index) => (
						<MetricCard
							key={metric.label}
							icon={metric.icon}
							label={metric.label}
							value={metric.value}
							recommendedValue={metric.recommendedValue}
							status={metric.status}
							isNew={hasNewData}
						/>
					))}
				</div>

				<div className={styles.centerReport}>
					<ReportCard />
				</div>
				<div className={styles.rightMetrics}>
					{rightMetrics.map((metric, index) => (
						<MetricCard
							key={metric.label}
							icon={metric.icon}
							label={metric.label}
							value={metric.value}
							recommendedValue={metric.recommendedValue}
							status={metric.status}
							isNew={hasNewData}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default EyeMetricsDisplay;
