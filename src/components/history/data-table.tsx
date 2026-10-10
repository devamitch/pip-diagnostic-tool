'use client';

import type React from 'react';

import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { ChevronDown, ChevronUp, Clock, Eye, Filter, Search, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import styles from './dataTable.module.scss';

type SortField = 'timestamp' | 'blinkRate' | 'strainLevel' | 'eyeAgeOffset' | 'screenTime';
type SortDirection = 'asc' | 'desc';

const DataTable = () => {
	const { history, selectedTimeframe, selectedDate } = useEyeTrackingStore();

	const [sortField, setSortField] = useState<SortField>('timestamp');
	const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 20;

	// Process and filter data
	const processedData = useMemo(() => {
		let data = history[selectedTimeframe] || [];

		// Filter by selected date if specified
		if (selectedDate) {
			data = data.filter((item) => {
				const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
				return itemDate === selectedDate;
			});
		}

		// Apply search filter
		if (searchTerm) {
			data = data.filter(
				(item) =>
					item.strainStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
					item.fatigueStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
					new Date(item.timestamp).toLocaleDateString().includes(searchTerm)
			);
		}

		// Apply status filter
		if (statusFilter !== 'all') {
			data = data.filter(
				(item) => item.strainStatus.toLowerCase() === statusFilter.toLowerCase()
			);
		}

		// Sort data
		data.sort((a, b) => {
			let aValue: any = a[sortField];
			let bValue: any = b[sortField];

			if (sortField === 'timestamp') {
				aValue = new Date(aValue).getTime();
				bValue = new Date(bValue).getTime();
			}

			if (sortDirection === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return data;
	}, [
		history,
		selectedTimeframe,
		selectedDate,
		searchTerm,
		statusFilter,
		sortField,
		sortDirection,
	]);

	// Pagination
	const totalPages = Math.ceil(processedData.length / itemsPerPage);
	const paginatedData = processedData.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	);

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortField(field);
			setSortDirection('desc');
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'low':
				return styles.statusLow;
			case 'moderate':
				return styles.statusModerate;
			case 'high':
				return styles.statusHigh;
			default:
				return styles.statusDefault;
		}
	};

	const getEyeAgeDisplay = (offset: number) => {
		if (offset === 0) return 'Normal';
		return offset > 0 ? `+${offset} years` : `${offset} years`;
	};

	const getEyeAgeColor = (offset: number) => {
		if (offset === 0) return styles.ageNormal;
		return offset > 0 ? styles.ageOlder : styles.ageYounger;
	};

	const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
		<button onClick={() => handleSort(field)} className={styles.sortButton}>
			{children}
			{sortField === field && (
				<span className={styles.sortIcon}>
					{sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
				</span>
			)}
		</button>
	);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h2 className={styles.title}>
					<Eye size={20} />
					Detailed Data View
				</h2>
				<p className={styles.subtitle}>Complete history of your eye tracking sessions</p>
			</div>

			<div className={styles.filters}>
				<div className={styles.searchBox}>
					<Search size={16} className={styles.searchIcon} />
					<input
						type="text"
						placeholder="Search by status or date..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className={styles.searchInput}
					/>
				</div>

				<div className={styles.filterGroup}>
					<Filter size={16} />
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className={styles.filterSelect}
					>
						<option value="all">All Status</option>
						<option value="low">Low Strain</option>
						<option value="moderate">Moderate Strain</option>
						<option value="high">High Strain</option>
					</select>
				</div>

				<div className={styles.resultsCount}>{processedData.length} records found</div>
			</div>

			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead className={styles.tableHeader}>
						<tr>
							<th>
								<SortButton field="timestamp">Date & Time</SortButton>
							</th>
							<th>
								<SortButton field="blinkRate">Blink Rate</SortButton>
							</th>
							<th>
								<SortButton field="strainLevel">Eye Strain</SortButton>
							</th>
							<th>
								<SortButton field="eyeAgeOffset">Eye Age</SortButton>
							</th>
							<th>
								<SortButton field="screenTime">Screen Time</SortButton>
							</th>
							<th>Attention</th>
							<th>Sleepiness</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody className={styles.tableBody}>
						{paginatedData.map((item, index) => (
							<tr key={index} className={styles.tableRow}>
								<td className={styles.timestampCell}>
									<div className={styles.timestamp}>
										<div className={styles.date}>
											{new Date(item.timestamp).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</div>
										<div className={styles.time}>
											{new Date(item.timestamp).toLocaleTimeString('en-US', {
												hour: '2-digit',
												minute: '2-digit',
											})}
										</div>
									</div>
								</td>
								<td>
									<div className={styles.metricCell}>
										<span className={styles.metricValue}>
											{item.blinkRate.toFixed(1)}
										</span>
										<span className={styles.metricUnit}>bpm</span>
									</div>
								</td>
								<td>
									<div className={styles.strainCell}>
										<span
											className={`${styles.strainLevel} ${getStatusColor(item.strainStatus)}`}
										>
											Level {item.strainLevel}
										</span>
										<span className={styles.strainText}>
											{item.strainStatus}
										</span>
									</div>
								</td>
								<td>
									<span
										className={`${styles.eyeAge} ${getEyeAgeColor(item.eyeAgeOffset)}`}
									>
										{getEyeAgeDisplay(item.eyeAgeOffset)}
									</span>
								</td>
								<td>
									<div className={styles.metricCell}>
										<Clock size={14} />
										<span className={styles.metricValue}>
											{Math.round(item.screenTimeToday / 3600)}
										</span>
										<span className={styles.metricUnit}>hrs</span>
									</div>
								</td>
								<td>
									<div className={styles.attentionCell}>
										<div className={styles.attentionBar}>
											<div
												className={styles.attentionFill}
												style={{ width: `${item.attentionLevel * 100}%` }}
											></div>
										</div>
										<span className={styles.attentionText}>
											{Math.round(item.attentionLevel * 100)}%
										</span>
									</div>
								</td>
								<td>
									<span
										className={`${styles.sleepinessIndicator} ${item.isSleepy ? styles.sleepy : styles.alert}`}
									>
										{item.isSleepy ? 'Sleepy' : 'Alert'}
									</span>
								</td>
								<td>
									<div className={styles.statusCell}>
										<span
											className={`${styles.statusBadge} ${getStatusColor(item.strainStatus)}`}
										>
											{item.strainStatus}
										</span>
										<span className={styles.fatigueStatus}>
											{item.fatigueStatus} Fatigue
										</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{paginatedData.length === 0 && (
				<div className={styles.emptyState}>
					<TrendingUp size={48} />
					<h3>No Data Found</h3>
					<p>No records match your current filters.</p>
					<p>Try adjusting your search terms or filters.</p>
				</div>
			)}

			{totalPages > 1 && (
				<div className={styles.pagination}>
					<button
						onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						className={styles.paginationButton}
					>
						Previous
					</button>

					<div className={styles.pageNumbers}>
						{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
							const pageNum =
								Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
							return (
								<button
									key={pageNum}
									onClick={() => setCurrentPage(pageNum)}
									className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
								>
									{pageNum}
								</button>
							);
						})}
					</div>

					<button
						onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
						className={styles.paginationButton}
					>
						Next
					</button>

					<div className={styles.pageInfo}>
						Page {currentPage} of {totalPages} ({processedData.length} total records)
					</div>
				</div>
			)}
		</div>
	);
};

export default DataTable;
