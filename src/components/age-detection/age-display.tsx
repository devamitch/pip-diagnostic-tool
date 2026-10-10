'use client';

import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { AlertCircle, CheckCircle, Minus, TrendingDown, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';
import styles from './ageDisplay.module.scss';

interface AgeDisplayProps {
	showDetails?: boolean;
	className?: string;
}

const AgeDisplay = ({ showDetails = false, className = '' }: AgeDisplayProps) => {
	const { currentMetrics, profile, updateProfile } = useEyeTrackingStore();
	const [isCalibrating, setIsCalibrating] = useState(false);
	const [showCalibration, setShowCalibration] = useState(false);

	// Calculate eye age status
	const getEyeAgeStatus = () => {
		const offset = currentMetrics.eyeAgeOffset;

		if (offset === 0) return { status: 'normal', icon: Minus, color: 'green', text: 'Normal' };
		if (offset > 0)
			return { status: 'older', icon: TrendingUp, color: 'red', text: `+${offset} years` };
		return { status: 'younger', icon: TrendingDown, color: 'blue', text: `${offset} years` };
	};

	const eyeAgeStatus = getEyeAgeStatus();
	const StatusIcon = eyeAgeStatus.icon;

	const handleCalibrateAge = async (actualAge: number) => {
		setIsCalibrating(true);

		// Update user profile with actual age
		updateProfile({ actualAge });

		// Simulate calibration process
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsCalibrating(false);
		setShowCalibration(false);
	};

	const getAgeRecommendation = () => {
		const offset = currentMetrics.eyeAgeOffset;

		if (offset > 3) {
			return 'Your eyes show signs of strain. Consider taking more breaks and practicing eye exercises.';
		} else if (offset > 1) {
			return 'Mild eye strain detected. Monitor your screen time and ensure proper lighting.';
		} else if (offset < -2) {
			return 'Your eyes appear well-rested. Keep up the good eye care habits!';
		} else {
			return 'Your eye age is normal for your detected age. Maintain current habits.';
		}
	};

	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<User size={20} />
					<h3 className={styles.title}>Age Analysis</h3>
				</div>

				<button
					onClick={() => setShowCalibration(true)}
					className={styles.calibrateButton}
					title="Calibrate age detection"
				>
					<AlertCircle size={16} />
					Calibrate
				</button>
			</div>

			<div className={styles.ageInfo}>
				<div className={styles.detectedAge}>
					<div className={styles.ageLabel}>Detected Age</div>
					<div className={styles.ageValue}>{currentMetrics.detectedAge} years</div>
					<div className={styles.confidence}>
						Confidence: {Math.round((currentMetrics.detectedAge > 0 ? 0.8 : 0.3) * 100)}
						%
					</div>
				</div>

				<div className={styles.eyeAge}>
					<div className={styles.ageLabel}>Eye Age Offset</div>
					<div className={`${styles.eyeAgeValue} ${styles[eyeAgeStatus.color]}`}>
						<StatusIcon size={20} />
						<span>{eyeAgeStatus.text}</span>
					</div>
					<div className={styles.eyeAgeDescription}>Relative to detected age</div>
				</div>
			</div>

			{showDetails && (
				<div className={styles.details}>
					<div className={styles.recommendation}>
						<h4 className={styles.recommendationTitle}>Recommendation</h4>
						<p className={styles.recommendationText}>{getAgeRecommendation()}</p>
					</div>

					<div className={styles.factors}>
						<h4 className={styles.factorsTitle}>Contributing Factors</h4>
						<div className={styles.factorsList}>
							<div className={styles.factor}>
								<span className={styles.factorLabel}>Blink Pattern:</span>
								<span className={styles.factorValue}>
									{currentMetrics.blinkRate < 15 ? 'Irregular' : 'Normal'}
								</span>
							</div>
							<div className={styles.factor}>
								<span className={styles.factorLabel}>Eye Strain:</span>
								<span className={styles.factorValue}>
									{currentMetrics.strainStatus}
								</span>
							</div>
							<div className={styles.factor}>
								<span className={styles.factorLabel}>Fatigue Level:</span>
								<span className={styles.factorValue}>
									{currentMetrics.fatigueStatus}
								</span>
							</div>
							<div className={styles.factor}>
								<span className={styles.factorLabel}>Sleepiness:</span>
								<span className={styles.factorValue}>
									{currentMetrics.isSleepy ? 'Detected' : 'None'}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}

			{showCalibration && (
				<div className={styles.calibrationModal}>
					<div
						className={styles.calibrationOverlay}
						onClick={() => setShowCalibration(false)}
					/>
					<div className={styles.calibrationContent}>
						<h3 className={styles.calibrationTitle}>Age Calibration</h3>
						<p className={styles.calibrationDescription}>
							Help improve age detection accuracy by confirming your actual age. This
							will be used to calculate more precise eye age offsets.
						</p>

						<div className={styles.currentDetection}>
							<div className={styles.detectionItem}>
								<span className={styles.detectionLabel}>Currently Detected:</span>
								<span className={styles.detectionValue}>
									{currentMetrics.detectedAge} years
								</span>
							</div>
							<div className={styles.detectionItem}>
								<span className={styles.detectionLabel}>Profile Age:</span>
								<span className={styles.detectionValue}>
									{profile.actualAge} years
								</span>
							</div>
						</div>

						<div className={styles.ageInput}>
							<label className={styles.inputLabel}>Your Actual Age:</label>
							<input
								type="number"
								min="16"
								max="100"
								defaultValue={profile.actualAge}
								className={styles.ageField}
								id="actual-age"
							/>
						</div>

						<div className={styles.calibrationActions}>
							<button
								onClick={() => setShowCalibration(false)}
								className={styles.cancelButton}
							>
								Cancel
							</button>
							<button
								onClick={() => {
									const input = document.getElementById(
										'actual-age'
									) as HTMLInputElement;
									const age = Number.parseInt(input.value);
									if (age >= 16 && age <= 100) {
										handleCalibrateAge(age);
									}
								}}
								className={styles.confirmButton}
								disabled={isCalibrating}
							>
								{isCalibrating ? (
									<>
										<div className={styles.spinner} />
										Calibrating...
									</>
								) : (
									<>
										<CheckCircle size={16} />
										Confirm
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AgeDisplay;
