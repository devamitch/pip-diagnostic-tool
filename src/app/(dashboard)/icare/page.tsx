'use client';
import React from 'react';
import styles from './IcarePage.module.css';
import { ExerciseData, hospitalsData, productsData } from '@/data';
import ExerciseCard from '@/components/icare/ExerciseCard/ExerciseCard';
import HospitalCard from '@/components/icare/HospitalCard/hospitalCard';
import ProductCard from '@/components/icare/ProductCard/ProductCard';

export default function ICarePage() {
	return (
		<div className={styles.container}>
			<>
				<h2 className={styles.sectionHeading}>Eye Exercises</h2>
				<div className={styles.mainSection}>
					{ExerciseData.map((exercise) => (
						<ExerciseCard
							key={exercise.title}
							title={exercise.title}
							image={exercise.image}
						/>
					))}
				</div>
			</>
			<>
				<h2 className={styles.sectionHeading}>Eye Products</h2>
				<div className={styles.mainSection}>
					{productsData.map((Product) => (
						<ProductCard
							key={Product.key}
							title={Product.title}
							description={Product.description}
							image={Product.image}
						/>
					))}
				</div>
			</>
			<>
				<h2 className={styles.sectionHeading}>Eye Specialists</h2>
				<div className={styles.mainSection}>
					{hospitalsData.map((hospital) => (
						<HospitalCard
							key={hospital.title}
							title={hospital.title}
							description={hospital.description}
							image={hospital.image}
						/>
					))}
				</div>
			</>
		</div>
	);
}
