'use client';

import { useEyeTrackingContext } from '@/provider/EyeTrackingProvider';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './EyeTrackingCamera.module.scss';

interface CameraProps {
	className?: string;
	showOverlay?: boolean;
}

export const CameraScreenOld: React.FC<CameraProps> = ({ className = '', showOverlay = true }) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const streamRef = useRef<MediaStream | null>(null);

	const [cameraState, setCameraState] = useState<{
		isActive: boolean;
		error: string | null;
		permissionState: 'prompt' | 'granted' | 'denied' | 'checking';
	}>({
		isActive: false,
		error: null,
		permissionState: 'prompt',
	});

	const { startTracking, stopTracking, isActive, error: trackingError } = useEyeTrackingContext();

	const error = cameraState.error || trackingError;

	const startCamera = async () => {
		try {
			setCameraState((prev) => ({ ...prev, permissionState: 'checking', error: null }));

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: 640,
					height: 480,
					facingMode: 'user',
				},
			});

			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				streamRef.current = stream;

				await new Promise<void>((resolve) => {
					const video = videoRef.current!;
					const onLoadedMetadata = () => {
						video.removeEventListener('loadedmetadata', onLoadedMetadata);
						resolve();
					};
					video.addEventListener('loadedmetadata', onLoadedMetadata);
				});

				setCameraState({
					isActive: true,
					error: null,
					permissionState: 'granted',
				});

				// Start eye tracking
				await startTracking();
			}
		} catch (err) {
			let errorMessage = 'Camera access failed';

			if (err instanceof Error) {
				if (err.name === 'NotAllowedError') {
					errorMessage =
						'Camera permission denied. Please allow camera access and try again.';
					setCameraState((prev) => ({ ...prev, permissionState: 'denied' }));
				} else if (err.name === 'NotFoundError') {
					errorMessage = 'No camera found. Please connect a camera and try again.';
				} else if (err.name === 'NotReadableError') {
					errorMessage = 'Camera is already in use by another application.';
				} else {
					errorMessage = `Camera error: ${err.message}`;
				}
			}

			setCameraState((prev) => ({
				...prev,
				error: errorMessage,
				isActive: false,
			}));
		}
	};

	const stopCamera = () => {
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}

		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}

		stopTracking();
		setCameraState({
			isActive: false,
			error: null,
			permissionState: 'prompt',
		});
	};

	useEffect(() => {
		return () => {
			stopCamera();
		};
	}, []);

	const getStatusIndicator = () => {
		if (error) return { text: 'Error', className: styles.error };
		if (isActive) return { text: 'Tracking', className: styles.tracking };
		if (cameraState.permissionState === 'checking')
			return { text: 'Initializing', className: styles.initializing };
		return null;
	};

	const status = getStatusIndicator();

	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.cameraContainer}>
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className={`${styles.video} ${!isActive ? styles.videoBlurred : ''}`}
				/>

				{showOverlay && <canvas ref={canvasRef} className={styles.overlay} />}

				{status && (
					<div className={`${styles.statusIndicator} ${status.className}`}>
						{status.text}
					</div>
				)}

				{!cameraState.isActive && !error && (
					<div className={styles.permissionOverlay}>
						<div className={styles.permissionContent}>
							<h3>Camera Access Required</h3>
							<p>
								This app needs camera access to track your eye movements for
								wellness monitoring.
							</p>
							<button onClick={startCamera} className={styles.startButton}>
								Enable Camera
							</button>
						</div>
					</div>
				)}

				{error && (
					<div className={styles.errorOverlay}>
						<div className={styles.errorContent}>
							<h3>Camera Error</h3>
							<p>{error}</p>
							{cameraState.permissionState === 'denied' && (
								<div className={styles.permissionHelp}>
									<p>To enable camera access:</p>
									<ol>
										<li>Click the camera icon in your browser's address bar</li>
										<li>Select "Allow" for camera permissions</li>
										<li>Refresh the page and try again</li>
									</ol>
								</div>
							)}
							<button onClick={startCamera} className={styles.retryButton}>
								Try Again
							</button>
						</div>
					</div>
				)}

				{cameraState.permissionState === 'checking' && !error && (
					<div className={styles.loadingOverlay}>
						<p>Initializing camera...</p>
					</div>
				)}

				{cameraState.isActive && (
					<div className={styles.controlsOverlay}>
						<button onClick={stopCamera} className={styles.stopButton}>
							Stop Camera
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
