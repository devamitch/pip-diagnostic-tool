'use client';

import { MetricsCardData } from '@/types';
import React from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Styles from './MetricsCard.module.css';

const EyeStrainCard: React.FC<{ data: MetricsCardData; metrics: any }> = ({ data, metrics }) => {
	return (
		<div className={Styles.card}>
			<div className={Styles.contentSection}>
				<div className={Styles.header}>
					<span className={Styles.name}>{data.name}</span>
					<span>{data.icon}</span>
				</div>
				<div className={Styles.valueContainer}>
					<span className={Styles.value}>{data.value}</span>
					{/* {data.unit && <span className={Styles.unit}>{data.unit}</span>} */}
				</div>
				<div className={Styles.status} data-status={data.status}>
					{metrics?.strainText || 'Normal'}
				</div>
			</div>

			<div className={Styles.chartSection}>
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data.graphData}
						margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
					>
						<Bar dataKey="v" radius={[4, 4, 0, 0]}>
							{data.graphData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.high ? '#D72638' : '#FF6B6B'}
								/>
							))}
						</Bar>
						<Tooltip
							formatter={(value) => {
								const levels = ['Low', 'Moderate', 'High'];
								return [`${levels[value as number] || 'Unknown'}`, 'Strain Level'];
							}}
							labelFormatter={(index) => `Measurement ${index + 1}`}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default EyeStrainCard;
