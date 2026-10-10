'use client';

import { MetricsCardData } from '@/types';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import Styles from './MetricsCard.module.css';

const BlinkRateCard: React.FC<{ data: MetricsCardData; metrics: any }> = ({ data, metrics }) => {
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
					{metrics?.strainText || 'Normal'}
				</div>
			</div>

			<div className={Styles.chartSection}>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data.graphData}
						margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
					>
						<defs>
							<linearGradient id="colorBlink" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#b86c25ff" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#fae3d4ff" stopOpacity={0} />
							</linearGradient>
						</defs>
						<Area
							type="monotone"
							dataKey="v"
							stroke="#d17b19d0"
							strokeWidth={2}
							fill="url(#colorBlink)"
						/>
						<Tooltip
							formatter={(value) => [`${value} blinks/min`, 'Blink Rate']}
							labelFormatter={(index) => `Measurement ${index + 1}`}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default BlinkRateCard;
