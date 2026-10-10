'use client';
import React, { useMemo } from 'react';
import {
	Bell,
	ChevronDown,
	MessageSquare,
	Search,
	LogOut,
	Settings as SettingsIcon,
	User as UserIcon,
} from 'lucide-react';
import styles from './Navbar.module.css';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase';
import DropdownMenu from '@/components/utils/Dropdown';
import { useAuth } from '@/provider/AuthProvider';

const formatPathname = (path: string) => {
	return path.charAt(0).toUpperCase() + path.slice(1);
};

export default function Navbar() {
	const { user } = useAuth();
	const pathname = usePathname();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.push('/signin');
		} catch (e) {
			console.error('Logout failed', e);
		}
	};

	const pagePath = useMemo(() => {
		return pathname.split('/')[1];
	}, [pathname]);

	return (
		<nav className={styles.navbar}>
			<h1 className={styles.header}>{formatPathname(pagePath)}</h1>
			<div className={styles.navItems}>
				<button className={styles.searchButton}>
					<Search size={20} color="rgba(72, 89, 83, 1)" />
					<input type="text" placeholder="Search..." className={styles.searchInput} />
				</button>
				<button className={styles.iconButton}>
					<MessageSquare
						size={20}
						color="rgba(72, 89, 83, 1)"
						fill="rgba(72, 89, 83, 1)"
					/>
				</button>
				<button className={styles.iconButton}>
					<Bell size={20} color="rgba(72, 89, 83, 1)" fill="rgba(72, 89, 83, 1)" />
				</button>

				<DropdownMenu
					trigger={
						<button className={styles.userSection} aria-label="User menu">
							<Image
								src="/mockData/profile.png"
								alt="Profile"
								width={36}
								height={36}
								className={styles.avatar}
							/>
							<span>
								<p className={styles.userName}>
									{user?.displayName }
								</p>
								<p className={styles.userEmail}>{user?.email}</p>
							</span>
							<ChevronDown size={18} color="rgba(72, 89, 83, 1)" />
						</button>
					}
					header={
						<div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
							<Image
								src={user?.photoURL || '/mockData/profile.png'}
								alt="Profile"
								width={44}
								height={44}
								className={styles.avatar}
							/>
							<div>
								<p className={styles.userName}>
									{user?.displayName}
								</p>
								<p className={styles.userEmail}>{user?.email}</p>
							</div>
						</div>
					}
					items={[
						{ label: 'Profile', icon: <UserIcon size={16} />, href: '/profile' },
						{ label: 'Settings', icon: <SettingsIcon size={16} />, href: '/settings' },
						{
							label: 'Logout',
							icon: <LogOut size={16} />,
							onSelect: handleLogout,
							danger: true,
						},
					]}
					align="center"
				/>
			</div>
		</nav>
	);
}
