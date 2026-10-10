'use client';

import { useFullScreen } from '@/hooks/useFullScreen';
import { usePiPState } from '@/hooks/usePiPState';
import { useVideoSync } from '@/hooks/useVideoSync';
import { useEyeTrackingContext } from '@/provider/EyeTrackingProvider';
import { usePiP } from '@/provider/PiPContext';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ControlButtons } from './ControlButtons';
import { FullScreenClose } from './FullScreenClose';
import { StatusIndicator } from './StatusIndicator';

import { usePathname } from 'next/navigation';
import styles from './picturein.module.scss';

// Type definitions for extended PiP APIs
interface DocumentPictureInPicture {
	requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
	readonly window: Window | null;
}

declare global {
	interface Window {
		documentPictureInPicture?: DocumentPictureInPicture;
	}
}

const PictureInMode = () => {
	const {
		videoRef,
		canvasRef,
		isActive,
		loading,
		error,
		cameraReady,
		startTracking,
		stopTracking,
	} = useEyeTrackingContext();

	const { isPiPExpanded, setIsPiPExpanded, isFullScreen } = usePiP();
	const { isVideoReady, isHovered, updateState } = usePiPState();
	const { toggleFullScreen } = useFullScreen();

	const pathname = usePathname();
	const containerRef = useRef<HTMLDivElement>(null);
	const [isInPiPMode, setIsInPiPMode] = useState(false);
	const [isAutoPiP, setIsAutoPiP] = useState(false);
	const pipWindowRef = useRef<Window | null>(null);
	const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const pipVideoRef = useRef<HTMLVideoElement | null>(null);
	const animationFrameRef = useRef<number>(0);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const isPiPSupportedRef = useRef(false);
	const isDocumentPiPRef = useRef(false);

	useVideoSync(videoRef, canvasRef, isVideoReady);

	// Check if PiP is supported
	useEffect(() => {
		const checkPipSupport = () => {
			const video = document.createElement('video');
			isPiPSupportedRef.current = !!(
				window.documentPictureInPicture ||
				(video.requestPictureInPicture && document.pictureInPictureEnabled)
			);
			isDocumentPiPRef.current = !!window.documentPictureInPicture;
		};

		checkPipSupport();
	}, []);

	// Store media stream reference
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadedMetadata = () => {
			if (video.srcObject) {
				mediaStreamRef.current = video.srcObject as MediaStream;
			}
		};

		video.addEventListener('loadedmetadata', handleLoadedMetadata);
		return () => {
			video.removeEventListener('loadedmetadata', handleLoadedMetadata);
		};
	}, [videoRef]);

	// Function to copy canvas content to PiP window
	const copyCanvasToPiP = useCallback(() => {
		if (!pipCanvasRef.current || !canvasRef.current || !isActive) return;

		const sourceCanvas = canvasRef.current;
		const targetCanvas = pipCanvasRef.current;

		// Only update if canvas has content
		if (sourceCanvas.width === 0 || sourceCanvas.height === 0) {
			animationFrameRef.current = requestAnimationFrame(copyCanvasToPiP);
			return;
		}

		// Resize target canvas if needed
		if (
			targetCanvas.width !== sourceCanvas.width ||
			targetCanvas.height !== sourceCanvas.height
		) {
			targetCanvas.width = sourceCanvas.width;
			targetCanvas.height = sourceCanvas.height;
		}

		const ctx = targetCanvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
			ctx.drawImage(sourceCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
		}

		// Continue animation if still in PiP mode
		if (isInPiPMode) {
			animationFrameRef.current = requestAnimationFrame(copyCanvasToPiP);
		}
	}, [canvasRef, isActive, isInPiPMode]);

	const exitPiPMode = useCallback(async (): Promise<boolean> => {
		try {
			// Cancel animation frame
			cancelAnimationFrame(animationFrameRef.current);

			// Handle Document PiP API
			if (pipWindowRef.current) {
				pipWindowRef.current.close();
			}
			// Handle standard PiP API
			else if (document.pictureInPictureElement) {
				await document.exitPictureInPicture();
			}

			// Clean up references
			pipWindowRef.current = null;
			pipCanvasRef.current = null;
			pipVideoRef.current = null;
			setIsInPiPMode(false);
			setIsAutoPiP(false);

			return true;
		} catch (error) {
			console.error('Failed to exit PiP mode:', error);
			return false;
		}
	}, []);

	// Handle Picture-in-Picture mode
	const enterPiPMode = useCallback(
		async (isAutomatic = false): Promise<boolean> => {
			if (!isPiPSupportedRef.current || !videoRef.current || isInPiPMode || !isActive)
				return false;

			try {
				// Get the media stream from the video element
				if (!mediaStreamRef.current && videoRef.current.srcObject) {
					mediaStreamRef.current = videoRef.current.srcObject as MediaStream;
				}

				if (!mediaStreamRef.current) {
					console.error('No media stream available for PiP');
					return false;
				}

				// Use Document PiP API if available
				if (isDocumentPiPRef.current && window.documentPictureInPicture) {
					const pipWindow = await window.documentPictureInPicture.requestWindow({
						width: 320,
						height: 200,
					});

					pipWindowRef.current = pipWindow;

					// Copy minimal necessary styles
					const style = document.createElement('style');
					style.textContent = `
          body { margin: 0; padding: 0; overflow: hidden; background: #000; }
          .pip-container { width: 100%; height: 100%; position: relative; overflow: hidden; }
          .pip-video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
          .pip-canvas { 
            position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
            object-fit: cover; transform: scaleX(-1); pointer-events: none; z-index: 10;
          }
          .pip-controls {
            position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 8px; z-index: 20; opacity: 0; transition: opacity 0.3s ease;
          }
          .pip-controls button {
            width: 32px; height: 32px; border: none; border-radius: 50%;
            background: rgba(0, 0, 0, 0.7); color: white; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
          }
        `;
					pipWindow.document.head.appendChild(style);

					// Create container in PiP window
					const container = document.createElement('div');
					container.className = 'pip-container';

					// Create video element for PiP window
					const videoClone = document.createElement('video');
					videoClone.className = 'pip-video';
					videoClone.autoplay = true;
					videoClone.playsInline = true;
					videoClone.muted = true;
					videoClone.srcObject = mediaStreamRef.current;

					pipVideoRef.current = videoClone;

					// Create canvas for PiP window - match exact dimensions
					const canvasClone = document.createElement('canvas');
					canvasClone.className = 'pip-canvas';

					// Set exact dimensions to match source canvas
					if (canvasRef.current) {
						canvasClone.width = canvasRef.current.width;
						canvasClone.height = canvasRef.current.height;
					}

					pipCanvasRef.current = canvasClone;

					// Create controls
					const controlsContainer = document.createElement('div');
					controlsContainer.className = 'pip-controls';

					// Exit button
					const exitButton = document.createElement('button');
					exitButton.innerHTML = '✕';
					exitButton.title = 'Exit PiP';
					exitButton.addEventListener('click', () => exitPiPMode());

					controlsContainer.appendChild(exitButton);

					container.appendChild(videoClone);
					container.appendChild(canvasClone);
					pipWindow.document.body.appendChild(container);
					pipWindow.document.body.appendChild(controlsContainer);

					// Add hover effect to show controls
					pipWindow.document.body.addEventListener('mouseenter', () => {
						controlsContainer.style.opacity = '1';
					});

					pipWindow.document.body.addEventListener('mouseleave', () => {
						controlsContainer.style.opacity = '0';
					});

					// Start the video in the PiP window
					videoClone
						.play()
						.catch((e) => console.error('Failed to play video in PiP:', e));

					// Handle PiP window closing
					pipWindow.addEventListener('pagehide', () => {
						cancelAnimationFrame(animationFrameRef.current);
						setIsInPiPMode(false);
						setIsAutoPiP(false);
						pipWindowRef.current = null;
						pipCanvasRef.current = null;
						pipVideoRef.current = null;
					});

					// Start copying canvas content
					animationFrameRef.current = requestAnimationFrame(copyCanvasToPiP);
				}
				// Fallback to standard PiP API
				else if (videoRef.current.requestPictureInPicture) {
					await videoRef.current.requestPictureInPicture();
				}

				setIsInPiPMode(true);
				if (isAutomatic) setIsAutoPiP(true);
				return true;
			} catch (error) {
				console.error('Failed to enter PiP mode:', error);
				return false;
			}
		},
		[videoRef, isInPiPMode, isActive, copyCanvasToPiP, canvasRef, exitPiPMode]
	);

	// Simple and reliable auto PiP management
	useEffect(() => {
		if (!isPiPSupportedRef.current || !isActive) return;

		let isCurrentlyActive = document.hasFocus() && !document.hidden;
		let timeoutId: NodeJS.Timeout;

		const checkActivity = () => {
			const isNowActive = document.hasFocus() && !document.hidden;

			// Website became inactive - enter PiP
			if (isCurrentlyActive && !isNowActive && !isInPiPMode) {
				enterPiPMode(true);
			}
			// Website became active - exit PiP if it was auto-activated
			else if (!isCurrentlyActive && isNowActive && isAutoPiP) {
				exitPiPMode();
			}

			isCurrentlyActive = isNowActive;
		};

		const handleVisibilityChange = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(checkActivity, 100);
		};

		const handleFocusChange = () => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(checkActivity, 100);
		};

		// Add event listeners
		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('blur', handleFocusChange);
		window.addEventListener('focus', handleFocusChange);

		// Initial check
		checkActivity();

		return () => {
			clearTimeout(timeoutId);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('blur', handleFocusChange);
			window.removeEventListener('focus', handleFocusChange);
		};
	}, [isActive, isInPiPMode, isAutoPiP, enterPiPMode, exitPiPMode]);

	// Handle video readiness and PiP events for standard API
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		const handleLoadedData = () => updateState({ isVideoReady: true });
		const handleError = () => updateState({ isVideoReady: false });

		video.addEventListener('loadeddata', handleLoadedData);
		video.addEventListener('error', handleError);

		// Handle PiP events for standard API
		const handleEnterPiP = () => setIsInPiPMode(true);
		const handleLeavePiP = () => {
			setIsInPiPMode(false);
			setIsAutoPiP(false);
			cancelAnimationFrame(animationFrameRef.current);
		};

		video.addEventListener('enterpictureinpicture', handleEnterPiP);
		video.addEventListener('leavepictureinpicture', handleLeavePiP);

		return () => {
			video.removeEventListener('loadeddata', handleLoadedData);
			video.removeEventListener('error', handleError);
			video.removeEventListener('enterpictureinpicture', handleEnterPiP);
			video.removeEventListener('leavepictureinpicture', handleLeavePiP);
		};
	}, [videoRef, updateState]);

	// Clean up on unmount
	useEffect(() => {
		return () => {
			cancelAnimationFrame(animationFrameRef.current);
			if (isInPiPMode) {
				exitPiPMode();
			}
		};
	}, [isInPiPMode, exitPiPMode]);

	const handleToggleTracking = useCallback(async () => {
		if (isActive) {
			stopTracking();
			// Also exit PiP if it was auto-activated
			if (isAutoPiP) {
				await exitPiPMode();
			}
		} else {
			try {
				await startTracking();
			} catch (err) {
				console.error('Failed to start tracking:', err);
				updateState({ error: 'Failed to start tracking' });
			}
		}
	}, [isActive, isAutoPiP, startTracking, stopTracking, updateState, exitPiPMode]);

	const handleToggleFullScreen = async () => {
		await toggleFullScreen(containerRef.current);
	};

	const handleToggleExpanded = () => {
		setIsPiPExpanded(!isPiPExpanded);
	};

	const handleTogglePiP = async () => {
		if (isInPiPMode) {
			await exitPiPMode();
		} else {
			await enterPiPMode(false);
		}
	};

	const handleMouseEnter = () => updateState({ isHovered: true });
	const handleMouseLeave = () => updateState({ isHovered: false });

	return (
		<div
			ref={containerRef}
			className={`${styles.cameraContainer} ${
				isPiPExpanded ? styles.expanded : styles.collapsed
			} ${isFullScreen ? styles.fullscreen : ''}
      ${pathname === '/live/' || pathname === '/live' ? styles['hidden'] : ''} 
      ${isInPiPMode ? styles.pipMode : ''}
      `}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div className={styles.glassEffect}>
				<video
					ref={videoRef}
					autoPlay
					playsInline
					muted
					className={styles.video}
					onLoadedData={() => updateState({ isVideoReady: true })}
					onError={() => updateState({ isVideoReady: false })}
				/>

				<canvas
					ref={canvasRef}
					className={styles.canvas}
					style={{
						display: isVideoReady && isActive ? 'block' : 'none',
						opacity: isActive ? 1 : 0,
						transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
					}}
				/>

				<ControlButtons
					isActive={isActive}
					isExpanded={isPiPExpanded}
					isFullScreen={isFullScreen}
					isHovered={isHovered}
					isInPiPMode={isInPiPMode}
					onToggleTracking={handleToggleTracking}
					onToggleExpanded={handleToggleExpanded}
					onToggleFullScreen={handleToggleFullScreen}
					onTogglePiP={handleTogglePiP}
				/>

				<StatusIndicator
					isActive={isActive}
					isExpanded={isPiPExpanded}
					isFullScreen={isFullScreen}
					isInPiPMode={isInPiPMode}
					isAutoPiP={isAutoPiP}
				/>

				<FullScreenClose isFullScreen={isFullScreen} onClose={handleToggleFullScreen} />
			</div>
		</div>
	);
};

export default PictureInMode;
