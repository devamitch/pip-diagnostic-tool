'use client';

import { onAuthStateChanged, User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { auth } from '../app/firebase';

interface AuthContextType {
	user: User | null;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	useLayoutEffect(() => {
		setLoaded(true);
	}, []);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	useEffect(() => {
		if (loading) return;

		const isAuthPage = pathname === '/signin' || pathname === '/register';
		const isPublicPage = isAuthPage || pathname === '/';

		if (user && isAuthPage) {
			router.push('/dashboard');
		}

		if (!user && !isPublicPage) {
			router.push('/signin');
		}
	}, [user, loading, pathname, router]);

	// if (typeof window !== 'undefined') {
	// 	return null;
	// }
	// if (!loaded) {
	// 	return children;
	// }

	return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
