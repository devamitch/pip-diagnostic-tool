'use client';
import { useState, useMemo, useEffect } from 'react';
import styles from './reporthistory.module.css';
import { Clock, BarChart3, Table } from 'lucide-react';
import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { BarChart, Bar, XAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import ModalView from '@/components/reportHistory/ModalView/ModalView';

function ReportHistory() {
	const { history, selectedTimeframe } = useEyeTrackingStore();
	const [selectedDate, setSelectedDate] = useState<string>('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedReport, setSelectedReport] = useState<any>(null);
	const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart'); // Toggle state
	const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('today');

	const chartData = useMemo(() => {
		const data = history[selectedTimeframe] || [];
		const filteredData = data.filter((item: any) => {
			const matchesDate = selectedDate
				? new Date(item.timestamp).toISOString().split('T')[0] === selectedDate
				: true;
			return matchesDate;
		});

		const minuteGroups: { [key: string]: any[] } = {};

		filteredData.forEach((item: any) => {
			const date = new Date(item.timestamp);
			const minuteKey = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

			if (!minuteGroups[minuteKey]) {
				minuteGroups[minuteKey] = [];
			}
			minuteGroups[minuteKey].push(item);
		});

		return Object.keys(minuteGroups)
			.sort()
			.map((time) => {
				const items = minuteGroups[time];
				const avgBlinkRate =
					items.reduce((sum, item) => sum + item.blinkRate, 0) / items.length;
				const avgEyeClosure =
					items.reduce((sum, item) => sum + item.perClose, 0) / items.length;
				const avgAttention =
					items.reduce((sum, item) => sum + item.attentionFrac, 0) / items.length;
				const avgStrainLevel =
					items.reduce((sum, item) => sum + item.strainLevelIdx, 0) / items.length;

				return {
					time,
					blinkRate: Math.round(avgBlinkRate),
					eyeClosure: Math.round(avgEyeClosure),
					attention: Math.round(avgAttention),
					strainLevel: Math.round(avgStrainLevel),
				};
			});
	}, [history, selectedTimeframe, selectedDate]);

	const historyData = useMemo(() => {
		const data = history[selectedTimeframe] || [];
		return data
			.filter((item: any) => {
				const matchesDate = selectedDate
					? new Date(item.timestamp).toISOString().split('T')[0] === selectedDate
					: true;

				return matchesDate;
			})
			.sort(
				(a: any, b: any) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
			);
	}, [history, selectedTimeframe, selectedDate]);

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
		setSelectedReport(report);
		setIsModalOpen(true);
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			if (!selectedDate) {
				setSelectedDate(new Date().toISOString().split('T')[0]);
			}
		}
	}, [selectedDate]);

	const closeModal = () => {
		setIsModalOpen(false);
		setSelectedReport(null);
	};

	return (
		<div className={styles.reportHistory}>
			<div className={styles.headerContainer}>
				<h2>Eye Scan Report</h2>
			</div>
			<div className={styles.container}>
				<div className={styles.controlsContainer}>
					<div className={styles.filterBadges}>
						<button
							className={`${styles.filterBadge} ${timeFilter === 'today' ? styles.active : ''}`}
							onClick={() => setTimeFilter('today')}
						>
							Today
						</button>
						<button
							className={`${styles.filterBadge} ${timeFilter === 'week' ? styles.active : ''}`}
							onClick={() => setTimeFilter('week')}
						>
							This Week
						</button>
						<button
							className={`${styles.filterBadge} ${timeFilter === 'month' ? styles.active : ''}`}
							onClick={() => setTimeFilter('month')}
						>
							This Month
						</button>
						<button
							className={`${styles.filterBadge} ${timeFilter === 'year' ? styles.active : ''}`}
							onClick={() => setTimeFilter('year')}
						>
							This Year
						</button>
					</div>

					<div className={styles.viewButtons}>
						<button
							className={`${styles.viewButton} ${viewMode === 'chart' ? styles.active : ''}`}
							onClick={() => setViewMode('chart')}
							title="Chart View"
						>
							<BarChart3 size={18} />
							Chart
						</button>
						<button
							className={`${styles.viewButton} ${viewMode === 'table' ? styles.active : ''}`}
							onClick={() => setViewMode('table')}
							title="Table View"
						>
							<Table size={18} />
							Table
						</button>
					</div>
				</div>

				{viewMode === 'chart' ? (
					<div className={styles.chartContainer}>
						<h3>Metrics Overview</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart
								data={chartData}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="6 6" />
								<XAxis dataKey="time" />
								<Legend />
								<Bar dataKey="blinkRate" fill="#8884d8" name="Blink Rate" />
								<Bar dataKey="eyeClosure" fill="#82ca9d" name="Eye Closure %" />
								<Bar dataKey="attention" fill="#ffc658" name="Attention" />
								<Bar dataKey="strainLevel" fill="#ff7300" name="Strain Level" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className={styles.tableContainer}>
						<div className={styles.tableHeader}>
							<span>Date</span>
							<span>Results</span>
							<span>Actions</span>
						</div>
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
									<div key={index} className={styles.tableRow}>
										<div className={styles.dateColumn}>
											<p>{formattedDate}</p>
											<p className={styles.time}>{formattedTime}</p>
										</div>
										<div className={styles.resultColumn}>
											<span
												className={`${styles.status} ${getStatusColor(report.strainText)}`}
											>
												{getStatusText(report.strainText)}
											</span>
											{report.strainText !== 'Low' && (
												<span className={styles.statusType}>
													{getStatusType(report.strainText)}
												</span>
											)}
										</div>
										<button
											className={styles.actionButton}
											onClick={() => handleViewReport(report)}
										>
											{getActionText(report.strainText)}
										</button>
									</div>
								);
							})
						) : (
							<div className={styles.emptyState}>
								<Clock size={48} />
								<p>No scan history found for {selectedDate || 'selected date'}</p>
								<p>Start tracking on the dashboard to see your history here</p>
							</div>
						)}
					</div>
				)}
			</div>

			<ModalView
				isModalOpen={isModalOpen}
				closeModal={closeModal}
				selectedReport={selectedReport}
				getStatusColor={getStatusColor}
				getStatusText={getStatusText}
			/>
		</div>
	);
}

export default ReportHistory;
