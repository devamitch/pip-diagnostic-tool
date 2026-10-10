'use client';

import { useEyeTrackingStore } from '@/store/eye-tracking-store';
import { BarChart3, Calendar, Download, Eye, LineChart, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	Pie,
	PieChart,
	LineChart as RechartsLineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import styles from './historyCharts.module.scss';

type ChartType = 'line' | 'area' | 'bar' | 'pie';
type MetricType = 'blinkRate' | 'eyeStrain' | 'sleepiness' | 'screenTime' | 'eyeAge';

const HistoryCharts = () => {
	const { history, selectedTimeframe, setTimeframe, selectedDate, setSelectedDate, exportData } =
		useEyeTrackingStore();

	const [chartType, setChartType] = useState<ChartType>('line');
	const [selectedMetric, setSelectedMetric] = useState<MetricType>('blinkRate');
	const [dateRange, setDateRange] = useState({
		start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		end: new Date().toISOString().split('T')[0],
	});

	// Process data for charts
	const processChartData = () => {
		const data = history[selectedTimeframe] || [];

		return data
			.filter((item) => {
				const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
				return itemDate >= dateRange.start && itemDate <= dateRange.end;
			})
			.map((item, index) => ({
				index: index + 1,
				timestamp: new Date(item.timestamp).toLocaleString('en-US', {
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
				}),
				date: new Date(item.timestamp).toLocaleDateString(),
				time: new Date(item.timestamp).toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
				}),
				blinkRate: item.blinkRate,
				eyeStrain: item.strainLevel,
				sleepiness: item.isSleepy ? 1 : 0,
				screenTime: Math.round(item.screenTimeToday / 3600), // Convert to hours
				eyeAge: item.eyeAgeOffset,
				attentionLevel: Math.round(item.attentionLevel * 100),
				eyeClosurePercentage: Math.round(item.eyeClosurePercentage),
				strainStatus: item.strainStatus,
				fatigueStatus: item.fatigueStatus,
			}));
	};

	const chartData = processChartData();

	// Chart configuration
	const getChartConfig = (metric: MetricType) => {
		const configs = {
			blinkRate: {
				dataKey: 'blinkRate',
				name: 'Blink Rate (per min)',
				color: '#3b82f6',
				unit: 'bpm',
			},
			eyeStrain: {
				dataKey: 'eyeStrain',
				name: 'Eye Strain Level',
				color: '#ef4444',
				unit: 'level',
			},
			sleepiness: {
				dataKey: 'sleepiness',
				name: 'Sleepiness Events',
				color: '#8b5cf6',
				unit: 'events',
			},
			screenTime: {
				dataKey: 'screenTime',
				name: 'Screen Time',
				color: '#f59e0b',
				unit: 'hours',
			},
			eyeAge: {
				dataKey: 'eyeAge',
				name: 'Eye Age Offset',
				color: '#10b981',
				unit: 'years',
			},
		};
		return configs[metric];
	};

	const config = getChartConfig(selectedMetric);

	// Custom tooltip
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			return (
				<div className={styles.tooltip}>
					<p className={styles.tooltipLabel}>{label}</p>
					<p className={styles.tooltipValue}>
						{config.name}: {payload[0].value} {config.unit}
					</p>
					<div className={styles.tooltipDetails}>
						<p>Attention: {data.attentionLevel}%</p>
						<p>Eye Closure: {data.eyeClosurePercentage}%</p>
						<p>Status: {data.strainStatus}</p>
					</div>
				</div>
			);
		}
		return null;
	};

	// Render different chart types
	const renderChart = () => {
		const commonProps = {
			data: chartData,
			margin: { top: 20, right: 30, left: 20, bottom: 20 },
		};

		switch (chartType) {
			case 'line':
				return (
					<RechartsLineChart {...commonProps}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
						<XAxis dataKey="timestamp" stroke="#6b7280" fontSize={12} />
						<YAxis stroke="#6b7280" fontSize={12} />
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<Line
							type="monotone"
							dataKey={config.dataKey}
							stroke={config.color}
							strokeWidth={2}
							dot={{ fill: config.color, strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6, stroke: config.color, strokeWidth: 2 }}
							name={config.name}
						/>
					</RechartsLineChart>
				);

			case 'area':
				return (
					<AreaChart {...commonProps}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
						<XAxis dataKey="timestamp" stroke="#6b7280" fontSize={12} />
						<YAxis stroke="#6b7280" fontSize={12} />
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<defs>
							<linearGradient
								id={`gradient-${selectedMetric}`}
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop offset="5%" stopColor={config.color} stopOpacity={0.8} />
								<stop offset="95%" stopColor={config.color} stopOpacity={0.1} />
							</linearGradient>
						</defs>
						<Area
							type="monotone"
							dataKey={config.dataKey}
							stroke={config.color}
							strokeWidth={2}
							fill={`url(#gradient-${selectedMetric})`}
							name={config.name}
						/>
					</AreaChart>
				);

			case 'bar':
				return (
					<BarChart {...commonProps}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
						<XAxis dataKey="timestamp" stroke="#6b7280" fontSize={12} />
						<YAxis stroke="#6b7280" fontSize={12} />
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<Bar
							dataKey={config.dataKey}
							fill={config.color}
							name={config.name}
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				);

			case 'pie':
				const pieData = [
					{
						name: 'Low Strain',
						value: chartData.filter((d) => d.eyeStrain === 0).length,
						color: '#10b981',
					},
					{
						name: 'Moderate Strain',
						value: chartData.filter((d) => d.eyeStrain === 1).length,
						color: '#f59e0b',
					},
					{
						name: 'High Strain',
						value: chartData.filter((d) => d.eyeStrain === 2).length,
						color: '#ef4444',
					},
				];

				return (
					<PieChart width={400} height={300}>
						<Pie
							data={pieData}
							cx={200}
							cy={150}
							outerRadius={80}
							fill="#8884d8"
							dataKey="value"
							label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
						>
							{pieData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip />
					</PieChart>
				);

			default:
				return null;
		}
	};

	const handleExport = () => {
		const dataStr = exportData();
		const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
		const exportFileDefaultName = `eye-tracking-data-${new Date().toISOString().split('T')[0]}.json`;

		const linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<div className={styles.titleSection}>
					<h2 className={styles.title}>
						<TrendingUp size={24} />
						Eye Health Analytics
					</h2>
					<p className={styles.subtitle}>
						Comprehensive analysis of your eye health metrics over time
					</p>
				</div>

				<button onClick={handleExport} className={styles.exportButton}>
					<Download size={16} />
					Export Data
				</button>
			</div>

			<div className={styles.controls}>
				<div className={styles.controlGroup}>
					<label className={styles.controlLabel}>Timeframe</label>
					<select
						value={selectedTimeframe}
						onChange={(e) => setTimeframe(e.target.value as any)}
						className={styles.select}
					>
						<option value="hourly">Hourly</option>
						<option value="daily">Daily</option>
						<option value="monthly">Monthly</option>
						<option value="yearly">Yearly</option>
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.controlLabel}>Metric</label>
					<select
						value={selectedMetric}
						onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
						className={styles.select}
					>
						<option value="blinkRate">Blink Rate</option>
						<option value="eyeStrain">Eye Strain</option>
						<option value="sleepiness">Sleepiness</option>
						<option value="screenTime">Screen Time</option>
						<option value="eyeAge">Eye Age Offset</option>
					</select>
				</div>

				<div className={styles.controlGroup}>
					<label className={styles.controlLabel}>Chart Type</label>
					<div className={styles.chartTypeButtons}>
						<button
							onClick={() => setChartType('line')}
							className={`${styles.chartTypeButton} ${chartType === 'line' ? styles.active : ''}`}
						>
							<LineChart size={16} />
						</button>
						<button
							onClick={() => setChartType('area')}
							className={`${styles.chartTypeButton} ${chartType === 'area' ? styles.active : ''}`}
						>
							<BarChart3 size={16} />
						</button>
						<button
							onClick={() => setChartType('bar')}
							className={`${styles.chartTypeButton} ${chartType === 'bar' ? styles.active : ''}`}
						>
							<BarChart3 size={16} />
						</button>
						<button
							onClick={() => setChartType('pie')}
							className={`${styles.chartTypeButton} ${chartType === 'pie' ? styles.active : ''}`}
						>
							<Eye size={16} />
						</button>
					</div>
				</div>

				<div className={styles.dateRange}>
					<div className={styles.dateInput}>
						<label className={styles.controlLabel}>From</label>
						<input
							type="date"
							value={dateRange.start}
							onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
							className={styles.dateField}
						/>
					</div>
					<div className={styles.dateInput}>
						<label className={styles.controlLabel}>To</label>
						<input
							type="date"
							value={dateRange.end}
							onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
							className={styles.dateField}
						/>
					</div>
				</div>
			</div>

			<div className={styles.chartContainer}>
				<div className={styles.chartHeader}>
					<h3 className={styles.chartTitle}>{config.name} Over Time</h3>
					<div className={styles.chartStats}>
						<div className={styles.stat}>
							<span className={styles.statLabel}>Total Data Points</span>
							<span className={styles.statValue}>{chartData.length}</span>
						</div>
						<div className={styles.stat}>
							<span className={styles.statLabel}>Average {config.name}</span>
							<span className={styles.statValue}>
								{chartData.length > 0
									? (
											chartData.reduce(
												(sum, item) => sum + (item[config.dataKey] || 0),
												0
											) / chartData.length
										).toFixed(1)
									: '0'}{' '}
								{config.unit}
							</span>
						</div>
					</div>
				</div>

				<div className={styles.chart}>
					<ResponsiveContainer width="100%" height={400}>
						{renderChart()}
					</ResponsiveContainer>
				</div>
			</div>

			{chartData.length === 0 && (
				<div className={styles.emptyState}>
					<Calendar size={48} />
					<h3>No Data Available</h3>
					<p>No eye tracking data found for the selected date range and timeframe.</p>
					<p>Start tracking on the dashboard to see your analytics here.</p>
				</div>
			)}
		</div>
	);
};

export default HistoryCharts;
