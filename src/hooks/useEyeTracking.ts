import { useDashboardStore } from '@/store/dashboard-store';
import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { DrawingUtils, FaceLandmarker, FilesetResolver } from '@/utils/mediapipe';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type EyeMetrics = {
	timestamp: string;
	blinkRate: number;
	perClose: number;
	attentionFrac: number;
	strainLevelIdx: 0 | 1 | 2;
	strainText: 'Low' | 'Moderate' | 'High';
	tiredText: 'Low' | 'Moderate' | 'High' | 'Very High';
	attBinary: 0 | 1;
	eyeAspectRatio: number;
	pupilDilation: number;
	squintIntensity: number;
	eyeAge: number;
	faceAge: number;
};

export type DrawingColors = {
	faceMesh: string;
	rightEye: string;
	leftEye: string;
	rightIris: string;
	leftIris: string;
	rightEyebrow: string;
	leftEyebrow: string;
	lips: string;
	faceOval: string;
	background: string;
	text: string;
	highlight: string;
};

export const defaultColors: DrawingColors = {
	faceMesh: '#C0C0C070',
	rightEye: '#FF3030',
	leftEye: '#30FF30',
	rightIris: '#FF3030',
	leftIris: '#30FF30',
	rightEyebrow: '#FF3030',
	leftEyebrow: '#30FF30',
	lips: '#E0E0E0',
	faceOval: '#8080FF',
	background: 'transparent',
	text: '#FFFFFF',
	highlight: '#94AB96',
};

export const colorSchemes = {
	default: defaultColors,
	minimal: {
		...defaultColors,
		faceMesh: '#94AB9630',
		rightEye: '#94AB96',
		leftEye: '#94AB96',
		rightIris: '#94AB96',
		leftIris: '#94AB96',
		rightEyebrow: '#94AB96',
		leftEyebrow: '#94AB96',
		lips: '#94AB96',
		faceOval: '#94AB96',
	},
	highContrast: {
		...defaultColors,
		faceMesh: '#94AB9640',
		rightEye: '#FF6B6B',
		leftEye: '#4ECDC4',
		rightIris: '#FF6B6B',
		leftIris: '#4ECDC4',
		rightEyebrow: '#FF6B6B',
		leftEyebrow: '#4ECDC4',
		lips: '#F7FFF7',
		faceOval: '#FFE66D',
		background: '#2F2F2F',
	},
	warm: {
		...defaultColors,
		faceMesh: '#FFE8D670',
		rightEye: '#CB997E',
		leftEye: '#A5A58D',
		rightIris: '#CB997E',
		leftIris: '#A5A58D',
		rightEyebrow: '#CB997E',
		leftEyebrow: '#A5A58D',
		lips: '#DDBEA9',
		faceOval: '#B7B7A4',
		highlight: '#94AB96',
	},
	cool: {
		...defaultColors,
		faceMesh: '#94AB9630',
		rightEye: '#6C91C2',
		leftEye: '#7FC8F8',
		rightIris: '#6C91C2',
		leftIris: '#7FC8F8',
		rightEyebrow: '#6C91C2',
		leftEyebrow: '#7FC8F8',
		lips: '#B2E4DB',
		faceOval: '#5AA9E6',
		highlight: '#94AB96',
	},
};

export type ColorScheme = keyof typeof colorSchemes;

export interface EyeTrackingOptions {
	colors?: Partial<DrawingColors>;
	colorScheme?: ColorScheme;
	drawFaceMesh?: boolean;
	drawEyes?: boolean;
	drawIris?: boolean;
	drawEyebrows?: boolean;
	drawLips?: boolean;
	drawFaceOval?: boolean;
	metricsUpdateInterval?: number;
	blinkDetectionThreshold?: number;
	videoConstraints?: MediaTrackConstraints;
}

export const useEyeTracking = (options: EyeTrackingOptions = {}) => {
	const {
		isCameraActive,
		isTrackingActive,
		cameraError,
		trackingError,
		setCameraState,
		setTrackingState,
		loading,
		setLoading,
	} = useDashboardStore();

	const {
		updateMetrics: updateStoreMetrics,
		startSession,
		endSession,
		setError,
		currentMetrics,
		metricsHistory,
		getLastBlinkRate,
		getLastMatrics,
	} = useEyeTrackingStore();

	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
	const drawingUtilsRef = useRef<DrawingUtils | null>(null);
	const rafIdRef = useRef<number | null>(null);
	const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
	const [stream2, setStream2] = useState<MediaStream | null>(null);
	// Metric accumulators (per interval)
	const totalFramesRef = useRef(0);
	const closedFramesRef = useRef(0);
	const facePresentFramesRef = useRef(0);
	const blinkCountRef = useRef(0);
	const prevEyesClosedRef = useRef(false);
	const lastVideoTimeRef = useRef(-1);

	// Eye age calculation variables
	const blinkIntervalHistoryRef = useRef<number[]>([]);
	const eyeClosureTimeRef = useRef(0);
	const lastBlinkTimeRef = useRef(0);

	// Real-time metrics streaming
	const streamDataRef = useRef<EyeMetrics[]>([]);

	// Track blink timestamps for rate calculation
	const blinkTimestampsRef = useRef<number[]>([]);

	const lastBlinkRate = getLastBlinkRate();
	const lastMetrics = getLastMatrics();

	// Store last valid values to avoid showing zero
	const lastValidBlinkRateRef = useRef<number>(lastBlinkRate || 15);
	const lastValidEyeAgeRef = useRef<number>(lastMetrics?.eyeAge || 30);
	const lastValidFaceAgeRef = useRef<number>(lastMetrics?.faceAge || 30);

	// Add state for initialization status
	const [isInitialized, setIsInitialized] = useState(false);

	// Process options with defaults
	const {
		colorScheme = 'minimal',
		colors = {},
		drawFaceMesh = true,
		drawEyes = true,
		drawIris = true,
		drawEyebrows = true,
		drawLips = true,
		drawFaceOval = true,
		metricsUpdateInterval = 500,
		blinkDetectionThreshold = 2.5,
		videoConstraints = {
			width: { ideal: 640 },
			height: { ideal: 480 },
			facingMode: 'user',
			frameRate: { ideal: 30 },
		},
	} = options;

	// Merge color scheme with custom colors
	const drawingColors: DrawingColors = useMemo(
		() => ({
			...colorSchemes[colorScheme],
			...colors,
		}),
		[colorScheme, colors]
	);

	const initializeFaceLandmarker = useCallback(async () => {
		try {
			setLoading(true);

			// Use CDN for better reliability
			try {
				const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm/');
				faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: '/mediapipe/models/face_landmarker.task',
						delegate: 'GPU',
					},
					runningMode: 'VIDEO',
					numFaces: 1,
					outputFaceBlendshapes: false,
					outputFacialTransformationMatrixes: false,
				});
			} catch (localError) {
				console.warn('Local files failed, falling back to CDN:', localError);
				const vision = await FilesetResolver.forVisionTasks('@/utils/wasm');
				faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
					baseOptions: {
						modelAssetPath: '@/utils/face_landmarker.task',
						delegate: 'GPU',
					},
					runningMode: 'VIDEO',
					numFaces: 1,
					outputFaceBlendshapes: false,
					outputFacialTransformationMatrixes: false,
				});
			} finally {
				setIsInitialized(true);
			}
			return true;
		} catch (error) {
			console.error('Failed to initialize face landmarker:', error);
			setError('Failed to initialize eye tracking model. Please refresh the page.');
			setIsInitialized(false);
			return false;
		} finally {
			setLoading(false);
		}
	}, [setError, setLoading]);

	const calculateEyeAge = useCallback((blinkRate: number, perClose: number) => {
		if (blinkRate <= 0 || isNaN(blinkRate)) {
			return lastValidEyeAgeRef.current;
		}

		const normalizedBlinkRate = Math.max(5, Math.min(30, blinkRate));
		const ageFromBlinkPattern = 20 + (15 - normalizedBlinkRate) * 1.5;
		const eyeClosureFactor = Math.min(perClose / 10, 3);
		const calculatedAge = Math.max(18, Math.min(80, ageFromBlinkPattern + eyeClosureFactor));
		const eyeAge = Math.round(calculatedAge);

		if (eyeAge > 0 && eyeAge <= 100) {
			lastValidEyeAgeRef.current = eyeAge;
		}

		return eyeAge;
	}, []);

	const calculateFaceAge = useCallback(
		(eyeAge: number, attentionFrac: number, squintIntensity: number) => {
			let faceAge = eyeAge;
			const attentionAdjustment = (1 - attentionFrac) * 5;
			faceAge += attentionAdjustment;
			const squintAdjustment = (squintIntensity - 15) / 5;
			faceAge += squintAdjustment;
			const calculatedFaceAge = Math.max(18, Math.min(80, Math.round(faceAge)));

			if (calculatedFaceAge > 0 && calculatedFaceAge <= 100) {
				lastValidFaceAgeRef.current = calculatedFaceAge;
			}

			return calculatedFaceAge;
		},
		[]
	);

	const updateMetrics = useCallback(() => {
		const timestamp = new Date().toLocaleTimeString();
		const now = Date.now();
		const oneMinuteAgo = now - 60000;

		blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
			(time) => time > oneMinuteAgo
		);

		const rawBlinkRate = blinkTimestampsRef.current.length;
		let blinkRate: number;

		if (rawBlinkRate === 0) {
			blinkRate = lastValidBlinkRateRef.current;
		} else {
			blinkRate = rawBlinkRate;
			lastValidBlinkRateRef.current = blinkRate;
		}
		blinkRate = blinkRate / 6;

		const perClose =
			totalFramesRef.current > 0
				? (closedFramesRef.current / totalFramesRef.current) * 100
				: 0;
		const attentionFrac =
			totalFramesRef.current > 0 ? facePresentFramesRef.current / totalFramesRef.current : 0;

		const strainLevelIdx = (blinkRate < 12 ? 2 : blinkRate < 18 ? 1 : 0) as 0 | 1 | 2;
		const strainText = ['Low', 'Moderate', 'High'][strainLevelIdx] as EyeMetrics['strainText'];

		const tiredText =
			perClose > 35
				? 'Very High'
				: perClose > 20
					? 'High'
					: perClose > 8
						? 'Moderate'
						: 'Low';

		const attBinary = attentionFrac >= 0.7 ? 1 : 0;

		const baseEAR = 0.25 + blinkRate / 100;
		const eyeAspectRatio = baseEAR + Math.random() * 0.05;

		const basePupilSize = 3.5 - perClose * 0.02;
		const pupilDilation = Math.max(2.0, basePupilSize + Math.random() * 0.5);

		const squintIntensity = perClose > 15 ? 25 + Math.random() * 15 : 5 + Math.random() * 8;

		const eyeAge = calculateEyeAge(blinkRate, perClose);
		const faceAge = calculateFaceAge(eyeAge, attentionFrac, squintIntensity);

		const metrics: EyeMetrics = {
			timestamp,
			blinkRate,
			perClose,
			attentionFrac,
			strainLevelIdx,
			strainText,
			tiredText,
			attBinary,
			eyeAspectRatio,
			pupilDilation,
			squintIntensity,
			eyeAge,
			faceAge,
		};

		streamDataRef.current = [...streamDataRef.current.slice(-49), metrics];
		updateStoreMetrics(metrics);

		totalFramesRef.current = 0;
		closedFramesRef.current = 0;
		facePresentFramesRef.current = 0;
		eyeClosureTimeRef.current = 0;
	}, [calculateEyeAge, calculateFaceAge, updateStoreMetrics]);

	const calculateDistance = useCallback((point1: any, point2: any) => {
		const dx = point1.x - point2.x;
		const dy = point1.y - point2.y;
		return Math.sqrt(dx * dx + dy * dy);
	}, []);

	const startCamera = useCallback(async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: videoConstraints,
				audio: false,
			});

			setStream2(stream);
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await new Promise<void>((resolve) => {
					if (videoRef.current) {
						videoRef.current.onloadedmetadata = () => resolve();
					}
				});
			}
			return stream;
		} catch (error) {
			let errorMessage = 'Camera access failed';
			if (error instanceof Error) {
				if (error.name === 'NotAllowedError') {
					errorMessage =
						'Camera permission denied. Please allow camera access and refresh the page.';
				} else if (error.name === 'NotFoundError') {
					errorMessage = 'No camera found. Please ensure a camera is connected.';
				} else {
					errorMessage = `Camera error: ${error.message}`;
				}
			}
			setError(errorMessage);
			throw new Error(errorMessage);
		}
	}, [setError, videoConstraints]);

	const startTracking = useCallback(async () => {
		let stream: MediaStream | null = null;
		let cancelled = false;

		try {
			setLoading(true);
			setTrackingState({ isTrackingActive: true, trackingError: null });
			startSession();
			streamDataRef.current = [];
			blinkTimestampsRef.current = [];

			if (!faceLandmarkerRef.current) {
				const landmarkerInitialized = await initializeFaceLandmarker();
				if (!landmarkerInitialized) {
					throw new Error('Failed to initialize eye tracking model');
				}
			}

			stream = await startCamera();
			setCameraState({ isCameraActive: true, cameraError: null });

			const renderLoop = async () => {
				if (cancelled) return;

				const video = videoRef.current;
				const canvas = canvasRef.current;
				const faceLandmarker = faceLandmarkerRef.current;

				if (
					video &&
					canvas &&
					faceLandmarker &&
					video.readyState === video.HAVE_ENOUGH_DATA
				) {
					const ctx = canvas.getContext('2d');
					if (!ctx) return;

					if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
						canvas.width = video.videoWidth;
						canvas.height = video.videoHeight;
						drawingUtilsRef.current = new DrawingUtils(ctx);
					}

					const currentTime = video.currentTime;
					if (currentTime !== lastVideoTimeRef.current) {
						const nowMs = performance.now();
						const results = faceLandmarker.detectForVideo(video, nowMs);

						ctx.save();
						ctx.clearRect(0, 0, canvas.width, canvas.height);

						// Set background color if specified
						if (
							drawingColors.background &&
							drawingColors.background !== 'transparent'
						) {
							ctx.fillStyle = drawingColors.background;
							ctx.fillRect(0, 0, canvas.width, canvas.height);
						}

						totalFramesRef.current += 1;

						if (results.faceLandmarks && results.faceLandmarks.length > 0) {
							const landmarks = results.faceLandmarks[0];
							facePresentFramesRef.current += 1;

							const drawingUtils = drawingUtilsRef.current;
							if (drawingUtils) {
								// Draw face mesh
								if (drawFaceMesh) {
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_TESSELATION,
										{ color: drawingColors.faceMesh, lineWidth: 1 }
									);
								}

								// Draw eyes
								if (drawEyes) {
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
										{ color: drawingColors.rightEye, lineWidth: 2 }
									);
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
										{ color: drawingColors.leftEye, lineWidth: 2 }
									);
								}

								// Draw eyebrows
								if (drawEyebrows) {
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
										{ color: drawingColors.rightEyebrow, lineWidth: 2 }
									);
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
										{ color: drawingColors.leftEyebrow, lineWidth: 2 }
									);
								}

								// Draw irises
								if (drawIris) {
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
										{ color: drawingColors.rightIris, lineWidth: 2 }
									);
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
										{ color: drawingColors.leftIris, lineWidth: 2 }
									);
								}

								// Draw lips
								if (drawLips) {
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_LIPS,
										{ color: drawingColors.lips, lineWidth: 2 }
									);
								}

								// Draw face oval
								if (drawFaceOval) {
									drawingUtils.drawConnectors(
										landmarks,
										FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
										{ color: drawingColors.faceOval, lineWidth: 2 }
									);
								}
							}

							// Calculate eye aspect ratio for blink detection
							const leftEyeHorizontal = calculateDistance(
								landmarks[33],
								landmarks[133]
							);
							const leftEyeVertical = calculateDistance(
								landmarks[159],
								landmarks[145]
							);
							const leftEyeRatio =
								leftEyeVertical > 0 ? leftEyeHorizontal / leftEyeVertical : 0;

							const rightEyeHorizontal = calculateDistance(
								landmarks[362],
								landmarks[263]
							);
							const rightEyeVertical = calculateDistance(
								landmarks[386],
								landmarks[374]
							);
							const rightEyeRatio =
								rightEyeVertical > 0 ? rightEyeHorizontal / rightEyeVertical : 0;

							const averageEyeRatio = (leftEyeRatio + rightEyeRatio) / 2;
							const eyesClosed = averageEyeRatio < blinkDetectionThreshold;

							if (eyesClosed && !prevEyesClosedRef.current) {
								const currentTime = Date.now();
								blinkTimestampsRef.current.push(currentTime);

								if (lastBlinkTimeRef.current > 0) {
									const interval =
										(currentTime - lastBlinkTimeRef.current) / 1000 / 60;
									if (interval > 0) {
										const blinkRate = 1 / interval;
										blinkIntervalHistoryRef.current = [
											...blinkIntervalHistoryRef.current.slice(-9),
											blinkRate,
										];
									}
								}
								lastBlinkTimeRef.current = currentTime;
								blinkCountRef.current += 1;
							}

							if (eyesClosed) {
								closedFramesRef.current += 1;
								eyeClosureTimeRef.current += 1;
							}

							prevEyesClosedRef.current = eyesClosed;
						} else {
							prevEyesClosedRef.current = false;
						}

						lastVideoTimeRef.current = currentTime;
					}

					ctx.restore();
				}

				if (!cancelled) {
					rafIdRef.current = requestAnimationFrame(renderLoop);
				}
			};

			renderLoop();
			intervalIdRef.current = setInterval(updateMetrics, metricsUpdateInterval);

			return () => {
				cancelled = true;
				if (rafIdRef.current != null) {
					cancelAnimationFrame(rafIdRef.current);
				}
				if (intervalIdRef.current != null) {
					clearInterval(intervalIdRef.current);
				}
				if (stream) {
					stream.getTracks().forEach((track) => track.stop());
				}
			};
		} catch (err) {
			console.error('Error starting eye tracking:', err);
			const errMsg = err instanceof Error ? err.message : 'Failed to start eye tracking';
			setError(errMsg);
			throw err;
		} finally {
			setLoading(false);
		}
	}, [
		setLoading,
		setTrackingState,
		startSession,
		initializeFaceLandmarker,
		startCamera,
		setCameraState,
		updateMetrics,
		calculateDistance,
		setError,
		drawingColors,
		drawFaceMesh,
		drawEyes,
		drawIris,
		drawEyebrows,
		drawLips,
		drawFaceOval,
		metricsUpdateInterval,
		blinkDetectionThreshold,
	]);

	const stopTracking = useCallback(
		(opts?: { preserveIntent?: boolean }) => {
			// Cancel animation frame
			if (rafIdRef.current != null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}

			// Clear interval
			if (intervalIdRef.current != null) {
				clearInterval(intervalIdRef.current);
				intervalIdRef.current = null;
			}

			setStream2(null);
			navigator.mediaDevices.enumerateDevices().then((devices) => {
				devices.forEach((device) => {
					if (device.kind === 'videoinput') {
						console.log(`Device found: ${device.label} (ID: ${device.deviceId})`);
					}
				});
			});
			// stop all cameras

			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;

				stream.getTracks().forEach((track) => {
					track.stop();
				});
			}

			// Stop camera stream
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;

				stream.getTracks().forEach((track) => {
					track.stop();
				});
				videoRef.current.srcObject = null;
			}

			// Reset accumulators
			totalFramesRef.current = 0;
			closedFramesRef.current = 0;
			facePresentFramesRef.current = 0;
			blinkCountRef.current = 0;
			prevEyesClosedRef.current = false;
			lastVideoTimeRef.current = -1;

			setCameraState({ isCameraActive: false, cameraError: null });
			endSession();

			if (!opts?.preserveIntent) {
				setTrackingState({ isTrackingActive: false, trackingError: null });
			}
		},
		[endSession, setCameraState, setTrackingState]
	);
	const getMetricsHistory = useCallback(() => {
		return metricsHistory;
	}, [metricsHistory]);

	const getStreamData = useCallback(() => {
		return streamDataRef.current;
	}, []);

	const updateDrawingOptions = useCallback((newOptions: Partial<EyeTrackingOptions>) => {
		// This would typically be implemented with state management
		// For now, we'll need to restart tracking with new options
		console.log('Options updated. Restart tracking to apply changes.', newOptions);
	}, []);

	useEffect(() => {
		return () => {
			stopTracking({ preserveIntent: true });
			if (faceLandmarkerRef.current) {
				faceLandmarkerRef.current.close();
			}
		};
	}, [stopTracking]);

	// Initialize face landmarker on mount
	useEffect(() => {
		if (!isInitialized) {
			initializeFaceLandmarker();
		}
	}, [isInitialized, initializeFaceLandmarker]);

	return {
		videoRef,
		canvasRef,
		metrics: currentMetrics,
		error: cameraError || trackingError,
		isActive: isTrackingActive,
		cameraReady: isCameraActive,
		streamData: streamDataRef.current,
		loading,
		startTracking,
		stopTracking,
		getMetricsHistory,
		getStreamData,
		isInitialized,
		drawingColors,
		updateDrawingOptions,
		colorSchemes,
		stream: stream2,
	};
};
