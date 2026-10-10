// ControlButtons.tsx
import { PiPControlHandlers } from '@/types/pip';
import { Expand, Minimize2, PictureInPicture, PlayCircle, StopCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './picturein.module.scss';

interface ControlButtonsProps extends PiPControlHandlers {
	isActive: boolean;
	isExpanded: boolean;
	isFullScreen: boolean;
	isHovered: boolean;
	isInPiPMode: boolean;
	onTogglePiP: any;
}

export const ControlButtons = ({
	isActive,
	isExpanded,
	isFullScreen,
	isHovered,
	isInPiPMode,
	onToggleTracking,
	onToggleExpanded,
	onToggleFullScreen,
	onTogglePiP,
}: ControlButtonsProps) => {
	const pathname = usePathname();

	return (
		<div
			className={`${styles.controlButtons} ${isHovered || isFullScreen ? styles.visible : ''}`}
			style={{
				visibility: pathname === '/live/' || pathname === '/live' ? 'hidden' : 'visible',
				opacity: pathname === '/live/' || pathname === '/live' ? 0 : 1,
			}}
		>
			<button
				className={`${styles.controlButton} ${isActive ? styles.active : ''}`}
				onClick={onToggleTracking}
				title={isActive ? 'Stop Tracking' : 'Start Tracking'}
			>
				{isActive ? <StopCircle size={16} /> : <PlayCircle size={16} />}
			</button>

			<button
				className={styles.controlButton}
				onClick={onToggleExpanded}
				title={isExpanded ? 'Collapse' : 'Expand'}
			>
				{isExpanded ? <Minimize2 size={16} /> : <Expand size={16} />}
			</button>

			<button
				className={styles.controlButton}
				onClick={onToggleFullScreen}
				title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
			>
				{isFullScreen ? <Minimize2 size={16} /> : <Expand size={16} />}
			</button>

			{/* PiP Toggle Button */}
			<button
				className={`${styles.controlButton} ${isInPiPMode ? styles.active : ''}`}
				onClick={onTogglePiP}
				title={isInPiPMode ? 'Exit PiP Mode' : 'Enter PiP Mode'}
			>
				<PictureInPicture size={16} />
			</button>
		</div>
	);
};
