'use client';
import React from 'react';
import styles from './RecentScan.module.css';
import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';
import { RecentScanProps } from '@/types';


function RecentScan({ report, chartData }: RecentScanProps) {
  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.title}>Eye Scan Report History</h2>
        <p className={styles.subtitle}>Confidence Average: {report.confidenceAverage}</p>
        <p className={styles.subtitle}>{report.condition}</p>
        <button className={styles.button}>View Full Report</button>
      </div>
      <div>
        <p className={styles.subtitle}>{report.date}</p>
        <div className={styles.chartSection}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barGap={2}
              margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
            >
               <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                                          {chartData.map((entry, index) => (
                                              <Cell
                                                  key={`cell-${index}`}
                                                  fill={entry.high ? '#f87171' : '#fda4af'}
                                              />
                                          ))}
                                      </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default RecentScan;