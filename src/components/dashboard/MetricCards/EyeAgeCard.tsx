'use client';

import { MetricsCardData } from '@/types';
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import Styles from './MetricsCard.module.css';

const EyeAgeCard: React.FC<{ data: MetricsCardData; metrics: any; faceAge?: number }> = ({
	data,
	metrics,
	faceAge,
}) => {
	return (
		<div className={Styles.card}>
			<div className={Styles.contentSection}>
				<div className={Styles.header}>
					<span className={Styles.name}>{data.name}</span>
					{/* <span>{data.icon}</span> */}
				</div>
				<div className={Styles.valueContainer}>
					<span className={Styles.value}>
						{data.value}
					</span>
				</div>
				<div className={Styles.status} data-status={data.status}>
					{metrics?.tiredText || 'Normal'}
				</div>
				{/* <div className={Styles.valueContainer}>
					{faceAge && <p className={Styles.unit}> Actual Age: {faceAge}</p>}
				</div> */}
			</div>

			<div className={Styles.chartSection}>
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart
						data={data.graphData}
						margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
					>
						<defs>
							<linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
								<stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
							</linearGradient>
						</defs>
						<Area
							type="monotone"
							dataKey="v"
							stroke="#38bdf8"
							strokeWidth={2}
							fill="url(#colorAge)"
						/>
						<Tooltip
							formatter={(value) => [`${value}%`, 'Eye Age']}
							labelFormatter={(index) => `Measurement ${index + 1}`}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

export default EyeAgeCard;
