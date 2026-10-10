'use client';
import ProfileCard from '@/components/profile/profileCard/ProfileCard';
import styles from './ProfilePage.module.css';
import { ExerciseData, eyeStrainData, mockReportBrief, screenTimeData, userData } from '@/data';
import ExerciseCard from '@/components/icare/ExerciseCard/ExerciseCard';
import Link from 'next/link';
import RecentScan from '@/components/profile/RecentScan/RecentScan';
import { useAuth } from '@/provider/AuthProvider';

export default function ProfilePage() {
	const { user } = useAuth();
	return (
		<div className={styles.container}>
			<ProfileCard
				name={user?.displayName || userData.name}
				email={user?.email || userData.email}
				image={user?.photoURL || userData.image}
			/>
			<>
				<h2 className={styles.sectionHeading}> Your Recent Scan</h2>
				<RecentScan report={mockReportBrief} chartData={eyeStrainData} />
			</>
			<>
				<h2 className={styles.sectionHeading}>Scan History</h2>
				<Link href="/history" className={styles.Historysection}>
					<h2 className={styles.title}>Eye Scan Report History</h2>
					<p className={styles.description}>Past eye scan results and track changes</p>
				</Link>
			</>
			<>
				<h2 className={styles.sectionHeading}>Personalised Advice</h2>
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
		</div>
	);
}
