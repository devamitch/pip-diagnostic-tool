import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
	// Camera state
	isCameraActive: boolean;
	loading: boolean;
	cameraError: string | null;
	cameraPermission: 'prompt' | 'granted' | 'denied' | 'checking';

	// Tracking state
	isTrackingActive: boolean;
	trackingError: string | null;

	// Screen time tracking
	loginTime: string | null;
	dailyScreenTime: number;
	lastResetDate: string;

	// Camera stream restoration
	cameraConfig: {
		width: number;
		height: number;
		facingMode: 'user' | 'environment';
	};

	// Actions
	setCameraState: (
		state: Partial<Pick<DashboardState, 'isCameraActive' | 'cameraError' | 'cameraPermission'>>
	) => void;
	setTrackingState: (
		state: Partial<Pick<DashboardState, 'isTrackingActive' | 'trackingError'>>
	) => void;
	setCameraConfig: (config: Partial<DashboardState['cameraConfig']>) => void;
	startScreenTime: () => void;
	updateScreenTime: () => void;
	resetDailyScreenTime: () => void;
	checkAndResetScreenTime: () => void;
	restoreCameraState: () => Promise<MediaStream | undefined>;
	setLoading: (loading: boolean) => void;
}

const defaultCameraConfig = {
	width: 640,
	height: 480,
	facingMode: 'user' as const,
};

const storage =
	typeof window !== 'undefined'
		? {
				getItem: (name: string) => {
					const item = localStorage.getItem(name);
					if (item) {
						try {
							return Promise.resolve(JSON.parse(item));
						} catch (e) {
							console.error('Failed to parse item from localStorage', e);
							return Promise.resolve(null);
						}
					}
					return Promise.resolve(null);
				},
				setItem: (name: string, value: any) => {
					try {
						localStorage.setItem(name, JSON.stringify(value));
					} catch (e) {
						console.error('Failed to set item in localStorage', e);
					}
					return Promise.resolve();
				},
				removeItem: (name: string) => {
					localStorage.removeItem(name);
					return Promise.resolve();
				},
			}
		: undefined;

export const useDashboardStore = create<DashboardState>()(
	persist(
		(set, get) => ({
			isCameraActive: false,
			cameraError: null,
			cameraPermission: 'prompt',
			isTrackingActive: false,
			trackingError: null,
			loginTime: null,
			dailyScreenTime: 0,
			lastResetDate: new Date().toISOString().split('T')[0],
			cameraConfig: defaultCameraConfig,
			loading: false,

			// Actions
			setLoading: (loading) => set({ loading }),

			setCameraState: (newState) => set(newState),

			setTrackingState: (newState) => set(newState),

			setCameraConfig: (config) =>
				set({ cameraConfig: { ...get().cameraConfig, ...config } }),

			startScreenTime: () => {
				const { checkAndResetScreenTime } = get();
				checkAndResetScreenTime();

				const now = new Date();
				set({ loginTime: now.toISOString() });

				const intervalId = setInterval(() => {
					get().updateScreenTime();
				}, 60000);

				(window as any).screenTimeInterval = intervalId;
			},

			updateScreenTime: () => {
				const { loginTime, checkAndResetScreenTime } = get();
				checkAndResetScreenTime();

				if (loginTime) {
					const now = new Date();
					const loginDate = new Date(loginTime);
					const seconds = Math.floor((now.getTime() - loginDate.getTime()) / 1000);
					set({ dailyScreenTime: seconds });
				}
			},

			resetDailyScreenTime: () => {
				if ((window as any).screenTimeInterval) {
					clearInterval((window as any).screenTimeInterval);
				}
				const today = new Date().toISOString().split('T')[0];
				set({
					dailyScreenTime: 0,
					loginTime: null,
					lastResetDate: today,
				});
			},

			checkAndResetScreenTime: () => {
				const { lastResetDate, resetDailyScreenTime } = get();
				const today = new Date().toISOString().split('T')[0];

				if (lastResetDate !== today) {
					resetDailyScreenTime();
				}
			},

			restoreCameraState: async () => {
				const { isCameraActive, cameraConfig } = get();
				if (isCameraActive) {
					try {
						const stream = await navigator.mediaDevices.getUserMedia({
							video: {
								width: cameraConfig.width,
								height: cameraConfig.height,
								facingMode: cameraConfig.facingMode,
							},
						});

						return stream;
					} catch (error) {
						console.error('Failed to restore camera:', error);
						set({
							isCameraActive: false,
							cameraError: 'Failed to restore camera after refresh',
						});
					}
				}
			},
		}),
		{
			name: 'dashboard-storage',
			partialize: (state) => ({
				isCameraActive: state.isCameraActive,
				isTrackingActive: state.isTrackingActive,
				cameraPermission: state.cameraPermission,
				loginTime: state.loginTime,
				dailyScreenTime: state.dailyScreenTime,
				lastResetDate: state.lastResetDate,
				loading: state.loading,
			}),
			storage,
		}
	)
);
