export interface FaceLandmarks {
	x: number;
	y: number;
	z?: number;
	visibility?: number;
}

export interface MediaPipeResults {
	faceLandmarks?: FaceLandmarks[][];
	faceBlendshapes?: Array<{
		categories: Array<{ categoryName: string; score: number }>;
	}>;
}

export interface EyeTrackingMetrics {
	timestamp: string;
	blinkRate: number;
	eyeStrain: number;
	attentionLevel: number;
	tiredness: number;
	perclos: number;
	attentionFrac: number;
	strainLevelIdx: 0 | 1 | 2;
	strainText: 'Low' | 'Moderate' | 'High';
	tiredText: 'Low' | 'Moderate' | 'High' | 'Very High';
	attBinary: 0 | 1;
	eyeAspectRatio: number;
	facePresent: boolean;
}

export interface HistoryData {
	hourly: EyeTrackingMetrics[];
	daily: EyeTrackingMetrics[];
	monthly: EyeTrackingMetrics[];
	yearly: EyeTrackingMetrics[];
}

export interface UserProfile {
	name: string;
	age: number;
	eyeAge: number;
	totalSessions: number;
	createdAt: string;
	lastActive: string;
}

export interface CameraConfig {
	width?: number;
	height?: number;
	facingMode?: 'user' | 'environment';
	frameRate?: number;
}
