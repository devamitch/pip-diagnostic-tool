'use client';

import { auth } from '@/app/firebase';
import {
	createUserWithEmailAndPassword,
	sendEmailVerification,
	updateProfile,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		acceptTerms: false,
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const router = useRouter();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const validateForm = () => {
		if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
			setError('All fields are required.');
			return false;
		}

		if (formData.password.length < 4) {
			setError('Password should be at least 4 characters.');
			return false;
		}

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match.');
			return false;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			setError('Please enter a valid email address.');
			return false;
		}

		if (!formData.acceptTerms) {
			setError('You must accept the terms and conditions.');
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError('');
		setSuccessMessage('');

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				formData.email,
				formData.password
			);
			await updateProfile(userCredential.user, { displayName: formData.name });

			// Send email verification
			await sendEmailVerification(userCredential.user);

			setSuccessMessage(
				'Registration successful! Please check your email to verify your account.'
			);

			// Clear form
			setFormData({
				name: '',
				email: '',
				password: '',
				confirmPassword: '',
				acceptTerms: false,
			});

			// Redirect after a short delay
			setTimeout(() => {
				router.push('/signin');
			}, 3000);
		} catch (err: any) {
			console.error('Registration error:', err);

			switch (err.code) {
				case 'auth/email-already-in-use':
					setError('This email is already registered. Please try signing in.');
					break;
				case 'auth/weak-password':
					setError('Password should be stronger ( and at least 4 characters).');
					break;
				case 'auth/invalid-email':
					setError('Please enter a valid email address.');
					break;
				case 'auth/operation-not-allowed':
					setError('Registration is temporarily disabled. Please try again later.');
					break;
				case 'auth/network-request-failed':
					setError('Network error. Please check your connection and try again.');
					break;
				case 'auth/configuration-not-found':
					setError('Firebase configuration error. Please contact support.');
					break;
				default:
					setError('An unexpected error occurred. Please try again.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.formWrapper}>
				<div className={styles.header}>
					<h1 className={styles.title}>Create Your Account</h1>
					<p className={styles.subtitle}>Join us to access premium eye care features</p>
				</div>

				<form onSubmit={handleSubmit} className={styles.form}>
					<div className={styles.inputGroup}>
						<label htmlFor="name" className={styles.label}>
							Full Name
						</label>
						<input
							id="name"
							name="name"
							type="text"
							value={formData.name}
							onChange={handleChange}
							placeholder="Enter your full name"
							required
							className={styles.input}
							disabled={isLoading}
						/>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor="email" className={styles.label}>
							Email Address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Enter your email"
							required
							className={styles.input}
							disabled={isLoading}
						/>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor="password" className={styles.label}>
							Password
						</label>
						<input
							id="password"
							name="password"
							type="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Create a password (min. 4 characters)"
							required
							className={styles.input}
							disabled={isLoading}
						/>
					</div>

					<div className={styles.inputGroup}>
						<label htmlFor="confirmPassword" className={styles.label}>
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder="Confirm your password"
							required
							className={styles.input}
							disabled={isLoading}
						/>
					</div>

					<div className={styles.checkboxGroup}>
						<input
							id="acceptTerms"
							name="acceptTerms"
							type="checkbox"
							checked={formData.acceptTerms}
							onChange={handleChange}
							className={styles.checkbox}
							disabled={isLoading}
						/>
						<label htmlFor="acceptTerms" className={styles.checkboxLabel}>
							I agree to the{' '}
							<Link href="/terms" className={styles.link}>
								Terms of Service
							</Link>{' '}
							and{' '}
							<Link href="/privacy" className={styles.link}>
								Privacy Policy
							</Link>
						</label>
					</div>

					<button
						type="submit"
						className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<span className={styles.spinner}></span>
								Creating Account...
							</>
						) : (
							'Create Account'
						)}
					</button>

					{error && (
						<div className={styles.error}>
							<svg
								className={styles.errorIcon}
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M14 10a4 4 0 11-16 0 4 4 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
							{error}
						</div>
					)}

					{successMessage && (
						<div className={styles.success}>
							<svg
								className={styles.successIcon}
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 14a4 4 0 100-16 4 4 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.546 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							{successMessage}
						</div>
					)}

					<div className={styles.linkContainer}>
						Already have an account?{' '}
						<Link href="/signin" className={styles.link}>
							Sign In
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
