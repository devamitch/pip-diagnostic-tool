'use client';
import React, { useState, useMemo, useEffect } from 'react';
import styles from './reportHistory.module.css';
import { ChevronDown, Search, Clock } from 'lucide-react';
import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { useRouter } from 'next/navigation';

function ReportHistory() {
	const router = useRouter();
	const { history, selectedTimeframe } = useEyeTrackingStore();
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedDate, setSelectedDate] = useState<string>(
		new Date().toISOString().split('T')[0]
	);

	const historyData = useMemo(() => {
		const data = history[selectedTimeframe] || [];
		return data
			.filter((item: any) => {
				const matchesSearch =
					searchTerm === '' ||
					item.strainText.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.tiredText.toLowerCase().includes(searchTerm.toLowerCase());

				const matchesDate = selectedDate
					? new Date(item.timestamp).toISOString().split('T')[0] === selectedDate
					: true;

				return matchesSearch && matchesDate;
			})
			.sort(
				(a: any, b: any) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
			);
	}, [history, selectedTimeframe, searchTerm, selectedDate]);

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedDate(e.target.value || new Date().toISOString().split('T')[0]);
	};

	const getStatusColor = (strainText: string) => {
		switch (strainText) {
			case 'Low':
				return styles.normal;
			case 'Moderate':
				return styles.blinkrate;
			case 'High':
				return styles.eyestrain;
			default:
				return styles.normal;
		}
	};

	const getStatusText = (strainText: string) => {
		switch (strainText) {
			case 'Low':
				return 'Normal';
			case 'Moderate':
				return 'Slightly Low Blink Rate';
			case 'High':
				return 'Eye Strain Detected';
			default:
				return 'Normal';
		}
	};

	const getStatusType = (strainText: string) => {
		switch (strainText) {
			case 'Low':
				return '';
			case 'Moderate':
				return 'Blink Rate';
			case 'High':
				return 'Eye Strain';
			default:
				return '';
		}
	};

	const getActionText = (strainText: string) => {
		return strainText === 'Low' ? 'Quick View' : 'View Report';
	};

	const handleViewReport = (report: any) => {
		const timestamp = new Date(report.timestamp).getTime();
		router.push(`/history/report/${timestamp}`);
	};

	useEffect(() => {
		if (!selectedDate) {
			setSelectedDate(new Date().toISOString().split('T')[0]);
		}
	}, [selectedDate, setSelectedDate]);

	return (
		<div className={styles.reportHistory}>
			<h2>Eye Scan Report History</h2>
			<div className={styles.filters}>
				<div className={styles.dateRange}>
					<input
						type="date"
						value={selectedDate || new Date().toISOString().split('T')[0]}
						onChange={handleDateChange}
						className={styles.dateInput}
					/>
				</div>

				<div className={styles.scanType}>
					<input
						type="text"
						placeholder="Scan type"
						className={styles.scanTypeInput}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<Search size={16} className={styles.searchIcon} />
				</div>
			</div>
			<div className={styles.tableContainer}>
				<div className={styles.historyTable}>
					<div className={styles.tableHeader}>
						<span>Date</span>
						<span>Results</span>
						<span>Actions</span>
					</div>
					<div className={styles.tableBody}>
						{historyData.length > 0 ? (
							historyData.map((report: any, index: number) => {
								const date = new Date(report.timestamp);
								const formattedDate = date.toLocaleDateString('en-US', {
									month: 'long',
									day: 'numeric',
									year: 'numeric',
								});
								const formattedTime = date.toLocaleTimeString('en-US', {
									hour: '2-digit',
									minute: '2-digit',
								});
								return (
									<React.Fragment key={index}>
										<div className={styles.tableRow}>
											<div className={styles.date}>
												<p>{formattedDate}</p>
												<p className={styles.time}>{formattedTime}</p>
											</div>
											<div className={styles.result}>
												<span
													className={`${styles.status} ${getStatusColor(report.strainText)}`}
												>
													{getStatusText(report.strainText)}
												</span>
												{report.strainText !== 'Low' && (
													<div className={styles.statusType}>
														{getStatusType(report.strainText)}
													</div>
												)}
											</div>
											<button
												className={styles.actionButton}
												onClick={() => handleViewReport(report)}
											>
												{getActionText(report.strainText)}
											</button>
										</div>
										{index < historyData.length - 1 && (
											<div className={styles.separator} />
										)}
									</React.Fragment>
								);
							})
						) : (
							<div className={styles.emptyState}>
								<Clock size={48} />
								<p>
									No scan history found for{' '}
									{selectedDate
										? new Date(selectedDate).toLocaleDateString()
										: 'today'}
								</p>
								<p>Start tracking on the dashboard to see your history here</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ReportHistory;
