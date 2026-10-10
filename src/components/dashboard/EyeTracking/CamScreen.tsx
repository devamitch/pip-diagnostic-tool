'use client';

import { EyeMetrics } from '@/hooks/useEyeTracking';
import { PlayCircle, StopCircle } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import styles from './CamScreen.module.css';

interface CamScreenProps {
	onMetricsUpdate?: (metrics: EyeMetrics) => void;
	showOverlay?: boolean;
	oldVideoRef: React.RefObject<HTMLVideoElement | null>;
	oldCanvasRef: React.RefObject<HTMLCanvasElement | null>;
	loading: boolean;
	error: string | null;
	isActive: boolean;
	cameraReady: boolean;
	onToggleTracking: () => void;
}

export const CamScreen: React.FC<CamScreenProps> = ({
	oldVideoRef,
	oldCanvasRef,
	loading,
	error,
	isActive,
	cameraReady,
	onToggleTracking,
}) => {
	const [isVideoReady, setIsVideoReady] = useState(false);
	const newVideoRef = useRef<HTMLVideoElement | null>(null);
	const newCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = useRef<number>();

	// Handle video stream setup
	useEffect(() => {
		if (newVideoRef.current && oldVideoRef.current?.srcObject) {
			newVideoRef.current.srcObject = oldVideoRef.current.srcObject;
		}
	}, [oldVideoRef.current?.srcObject]);

	// Handle canvas drawing from old canvas to new canvas
	useEffect(() => {
		const drawCanvas = () => {
			const oldCanvas = oldCanvasRef.current;
			const newCanvas = newCanvasRef.current;

			if (oldCanvas && newCanvas) {
				const ctx = newCanvas.getContext('2d');
				if (ctx) {
					// Clear the new canvas
					ctx.clearRect(0, 0, newCanvas.width, newCanvas.height);

					// Draw the old canvas content to the new canvas
					ctx.drawImage(oldCanvas, 0, 0, newCanvas.width, newCanvas.height);
				}
			}

			// Continue the animation loop
			animationFrameRef.current = requestAnimationFrame(drawCanvas);
		};

		if (isActive && isVideoReady) {
			animationFrameRef.current = requestAnimationFrame(drawCanvas);
		}

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isActive, isVideoReady, oldCanvasRef.current]);

	// Handle canvas synchronization with video
	useEffect(() => {
		const video = newVideoRef.current;
		const canvas = newCanvasRef.current;

		if (video && canvas && isVideoReady) {
			// Sync canvas size with video
			if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
			}
		}
	}, [isVideoReady, isActive]);

	// Handle video readiness
	useEffect(() => {
		const video = newVideoRef.current;
		if (!video) return;

		const handleLoadedData = () => {
			setIsVideoReady(true);
		};

		const handleError = () => {
			setIsVideoReady(false);
		};

		video.addEventListener('loadeddata', handleLoadedData);
		video.addEventListener('error', handleError);

		return () => {
			video.removeEventListener('loadeddata', handleLoadedData);
			video.removeEventListener('error', handleError);
		};
	}, []);

	return (
		<div className={styles.container}>
			<div className={styles.cameraContainer}>
				<video
					ref={newVideoRef}
					autoPlay
					playsInline
					muted
					className={styles.video}
					style={{ display: isVideoReady ? 'block' : 'none' }}
				/>

				<canvas
					ref={newCanvasRef}
					className={styles.canvas}
					style={{
						display: isVideoReady && isActive ? 'block' : 'none',
						opacity: isActive ? 1 : 0,
						transition: 'opacity 0.3s ease',
					}}
				/>

				{/* Control buttons and overlays */}
				<div className={styles.controlButtons}>
					<button
						className={`${styles.controlButton} ${isActive ? styles.active : ''}`}
						onClick={onToggleTracking}
					>
						{isActive ? <StopCircle size={20} /> : <PlayCircle size={20} />}
					</button>
				</div>

				{/* Loading and error states */}
				{loading && (
					<div className={styles.overlay}>
						<div className={styles.loading}>
							<div className={styles.spinner}></div>
							<p>
								{isVideoReady ? 'Starting tracking...' : 'Initializing camera...'}
							</p>
						</div>
					</div>
				)}

				{error && (
					<div className={styles.overlay}>
						<div className={styles.error}>
							<p>{error}</p>
							<button onClick={onToggleTracking} className={styles.retryButton}>
								Retry
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CamScreen;
