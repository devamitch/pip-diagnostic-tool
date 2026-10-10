import React, { useEffect } from 'react'
//@ts-ignore
import Modal from 'react-modal';
import { Eye, Activity, Brain, AlertTriangle, Battery, Zap } from 'lucide-react';
import styles from './modalview.module.css';

interface ModalViewProps {
	isModalOpen: boolean;
	closeModal: () => void;
	selectedReport: any;
	getStatusColor: (strainText: string) => string;
	getStatusText: (strainText: string) => string;
}

const ModalView: React.FC<ModalViewProps> = ({ 
	isModalOpen, 
	closeModal, 
	selectedReport, 
	getStatusColor, 
	getStatusText 
}) => {
	useEffect(() => {
		if (typeof window !== 'undefined') {
			Modal.setAppElement('body');
		}
	}, []);

	const metricCards = selectedReport ? [
		{
			title: 'Blink Rate',
			value: selectedReport.blinkRate,
			unit: 'blinks/min',
			icon: Eye
		},
		{
			title: 'Eye Closure',
			value: `${selectedReport.perClose?.toFixed(2)}%`,
			unit: 'closure percentage',
			icon: Activity
		},
		{
			title: 'Attention Level',
			value: `${(selectedReport.attentionFrac * 100).toFixed(1)}%`,
			unit: 'attention score',
			icon: Brain
		},
		{
			title: 'Strain Level',
			value: selectedReport.strainText,
			unit: 'strain intensity',
			colorClass: getStatusColor(selectedReport.strainText),
			icon: AlertTriangle
		},
		{
			title: 'Tiredness Level',
			value: selectedReport.tiredText,
			unit: 'fatigue level',
			icon: Battery
		},
		{
			title: 'Eye Aspect Ratio',
			value: selectedReport.eyeAspectRatio?.toFixed(3),
			unit: 'ratio',
			icon: Zap
		}
	] : [];

  return (
    	<Modal
				isOpen={isModalOpen}
				onRequestClose={closeModal}
				contentLabel="Report Details"
				className={styles.modal}
				overlayClassName={styles.modalOverlay}
			>
				<div className={styles.modalHeader}>
					<h3>Report Details</h3>
					<button className={styles.closeButton} onClick={closeModal}>×</button>
				</div>
				
				<div className={styles.modalContent}>
					{selectedReport && (
						<>
							<div className={styles.reportDetailHeader}>
								<div className={styles.reportTimestamp}>
									{new Date(selectedReport.timestamp).toLocaleString()}
								</div>
								<div className={`${styles.reportStatus} ${getStatusColor(selectedReport.strainText)}`}>
									{getStatusText(selectedReport.strainText)}
								</div>
							</div>

							<div className={styles.reportMetrics}>
								{metricCards.map((metric, index) => {
									return (
										<div key={index} className={styles.metricCard}>
											<metric.icon size={24} className={styles.cardIcon} />
											<h4>{metric.title}</h4>
											<h5 className={styles.metricUnit}>{metric.unit}</h5>
											<h2 className={`${styles.metricValue} ${metric.colorClass || ''}`}>
												{metric.value}
											</h2>
										</div>
									);
								})}
							</div>
						</>
					)}
				</div>
			</Modal>
  )
}

export default ModalView