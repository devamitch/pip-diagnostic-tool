'use client';

import { MetricsCardData } from '@/types';
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip } from 'recharts';
import Styles from './MetricsCard.module.css';

const ScreenTimeCard: React.FC<{ data: MetricsCardData; metrics: any }> = ({ data, metrics }) => {
	return (
		<div className={Styles.card}>
			<div className={Styles.contentSection}>
				<div className={Styles.header}>
					<span className={Styles.name}>{data.name}</span>
					<span>{data.icon}</span>
				</div>
				<div className={Styles.valueContainer}>
					<span className={Styles.value}>{data.value}</span>
					{data.unit && <span className={Styles.unit}>{data.unit}</span>}
				</div>
				<div className={Styles.status} data-status={data.status}>
					Normal
				</div>
			</div>

			<div className={Styles.chartSection}>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data.graphData}
						margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
					>
						<Bar
							dataKey="v"
							fill="#c4b5fd"
							color="linear"
							radius={[10, 10, 10, 10]}
							width={15}
						/>
						<Tooltip
							formatter={(value) => [`${value}%`, 'Screen Time']}
							labelFormatter={(index) => `Hour ${index + 1}`}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default ScreenTimeCard;
