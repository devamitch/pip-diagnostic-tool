'use client';

import { auth } from '@/app/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './LoginForm.module.css';
import { useDashboardStore } from '@/store/dashboard-store';

export default function LoginForm() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [error, setError] = useState({ type: '', message: '' });
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [showResetForm, setShowResetForm] = useState(false);
	const [resetEmail, setResetEmail] = useState('');
	const router = useRouter();
	const { startScreenTime } = useDashboardStore();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user starts typing
		if (error.type) setError({ type: '', message: '' });
	};

	const validateForm = () => {
		if (!formData.email || !formData.password) {
			setError({
				type: 'empty_fields',
				message: 'Please fill in all fields.',
			});
			return false;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			setError({
				type: 'invalid_email',
				message: 'Please enter a valid email address.',
			});
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError({ type: '', message: '' });
		setSuccessMessage('');

		if (!validateForm()) return;

		setIsLoading(true);

		try {
			await signInWithEmailAndPassword(auth, formData.email, formData.password);
			setSuccessMessage('Login successful! Redirecting to your dashboard...');
			startScreenTime();

			// Redirect to dashboard after successful login
			setTimeout(() => {
				router.push('/dashboard');
			}, 1500);
		} catch (err: any) {
			console.error('Login error:', err);

			switch (err.code) {
				case 'auth/user-not-found':
					setError({
						type: 'user_not_found',
						message:
							'No account found with this email address. Please check your email or register for a new account.',
					});
					break;
				case 'auth/wrong-password':
					setError({
						type: 'wrong_password',
						message:
							"Incorrect password. Please try again or reset your password if you've forgotten it.",
					});
					break;
				case 'auth/invalid-credential':
					setError({
						type: 'invalid_credentials',
						message: 'Invalid login credentials. Please check your email and password.',
					});
					break;
				case 'auth/invalid-email':
					setError({
						type: 'invalid_email_format',
						message:
							'The email address is not properly formatted. Please check for typos.',
					});
					break;
				case 'auth/user-disabled':
					setError({
						type: 'account_disabled',
						message:
							'This account has been disabled. Please contact support for assistance.',
					});
					break;
				case 'auth/too-many-requests':
					setError({
						type: 'too_many_attempts',
						message:
							'Too many failed login attempts. Please try again later or reset your password.',
					});
					break;
				case 'auth/network-request-failed':
					setError({
						type: 'network_error',
						message:
							'Network connection failed. Please check your internet connection and try again.',
					});
					break;
				case 'auth/configuration-not-found':
					setError({
						type: 'firebase_config',
						message: 'Firebase configuration error. Please contact support.',
					});
					break;
				default:
					setError({
						type: 'unknown_error',
						message:
							err?.message ||
							'An unexpected error occurred. Please try again or contact support if the problem persists.',
					});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setError({ type: '', message: '' });

		if (!resetEmail) {
			setError({
				type: 'reset_empty_email',
				message: 'Please enter your email address to reset your password.',
			});
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
			setError({
				type: 'reset_invalid_email',
				message: 'Please enter a valid email address.',
			});
			return;
		}

		setIsLoading(true);

		try {
			await sendPasswordResetEmail(auth, resetEmail);
			setSuccessMessage(
				'Password reset email sent! Please check your inbox for instructions.'
			);
			setShowResetForm(false);
			setResetEmail('');
		} catch (err: any) {
			console.error('Password reset error:', err);

			if (err.code === 'auth/user-not-found') {
				setError({
					type: 'reset_user_not_found',
					message:
						'No account found with this email address. Please check your email or register for a new account.',
				});
			} else {
				setError({
					type: 'reset_failed',
					message: 'Failed to send reset email. Please try again later.',
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	const getErrorIcon = () => {
		switch (error.type) {
			case 'user_not_found':
				return '✉️';
			case 'wrong_password':
				return '🔒';
			case 'invalid_credentials':
				return '❌';
			case 'invalid_email':
			case 'invalid_email_format':
				return '📧';
			case 'account_disabled':
				return '🚫';
			case 'too_many_attempts':
				return '⏱️';
			case 'network_error':
				return '📡';
			default:
				return '⚠️';
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.formWrapper}>
				<div className={styles.header}>
					<h1 className={styles.title}>Welcome Back</h1>
					<p className={styles.subtitle}>Sign in to access your eye care dashboard</p>
				</div>

				{!showResetForm ? (
					<form onSubmit={handleSubmit} className={styles.form}>
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
								className={`${styles.input} ${error.type.includes('email') ? styles.inputError : ''}`}
								disabled={isLoading}
							/>
							{error.type.includes('email') && (
								<div className={styles.fieldErrorIndicator}>
									<span>⚠️</span>
								</div>
							)}
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
								placeholder="Enter your password"
								required
								className={`${styles.input} ${error.type.includes('password') ? styles.inputError : ''}`}
								disabled={isLoading}
							/>
							{error.type.includes('password') && (
								<div className={styles.fieldErrorIndicator}>
									<span>⚠️</span>
								</div>
							)}
						</div>

						<div className={styles.forgotPassword}>
							<button
								type="button"
								onClick={() => setShowResetForm(true)}
								className={styles.forgotLink}
								disabled={isLoading}
							>
								Forgot your password?
							</button>
						</div>

						<button
							type="submit"
							className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<span className={styles.spinner}></span>
									Signing In...
								</>
							) : (
								'Sign In'
							)}
						</button>

						{error.message && (
							<div className={styles.error}>
								<div className={styles.errorIcon}>{getErrorIcon()}</div>
								<div className={styles.errorContent}>
									<div className={styles.errorTitle}>
										{error.type === 'user_not_found' && 'Account Not Found'}
										{error.type === 'wrong_password' && 'Incorrect Password'}
										{error.type === 'invalid_credentials' &&
											'Invalid Credentials'}
										{error.type === 'invalid_email' && 'Invalid Email'}
										{error.type === 'invalid_email_format' &&
											'Invalid Email Format'}
										{error.type === 'account_disabled' && 'Account Disabled'}
										{error.type === 'too_many_attempts' && 'Too Many Attempts'}
										{error.type === 'network_error' && 'Network Error'}
										{error.type === 'empty_fields' && 'Missing Information'}
										{![
											'user_not_found',
											'wrong_password',
											'invalid_credentials',
											'invalid_email',
											'invalid_email_format',
											'account_disabled',
											'too_many_attempts',
											'network_error',
											'empty_fields',
										].includes(error.type) && 'Login Error'}
									</div>
									<div className={styles.errorMessage}>{error.message}</div>
									<div className={styles.errorActions}>
										{(error.type === 'user_not_found' ||
											error.type === 'reset_user_not_found') && (
											<Link href="/register" className={styles.errorLink}>
												Create a new account
											</Link>
										)}
										{(error.type === 'wrong_password' ||
											error.type === 'invalid_credentials') && (
											<button
												type="button"
												onClick={() => setShowResetForm(true)}
												className={styles.errorLinkButton}
											>
												Reset password
											</button>
										)}
										{error.type === 'network_error' && (
											<button
												type="button"
												onClick={() => window.location.reload()}
												className={styles.errorLinkButton}
											>
												Try again
											</button>
										)}
									</div>
								</div>
							</div>
						)}

						{successMessage && (
							<div className={styles.success}>
								<div className={styles.successIcon}>✅</div>
								<div className={styles.successContent}>
									<div className={styles.successTitle}>Success!</div>
									<div className={styles.successMessage}>{successMessage}</div>
								</div>
							</div>
						)}

						<div className={styles.linkContainer}>
							Don&apos;t have an account?{' '}
							<Link href="/register" className={styles.link}>
								Create Account
							</Link>
						</div>
					</form>
				) : (
					<form onSubmit={handlePasswordReset} className={styles.form}>
						<h2 className={styles.resetTitle}>Reset Password</h2>
						<p className={styles.resetSubtitle}>
							Enter your email to receive a password reset link
						</p>

						<div className={styles.inputGroup}>
							<label htmlFor="resetEmail" className={styles.label}>
								Email Address
							</label>
							<input
								id="resetEmail"
								name="resetEmail"
								type="email"
								value={resetEmail}
								onChange={(e) => setResetEmail(e.target.value)}
								placeholder="Enter your email"
								required
								className={`${styles.input} ${error.type.includes('reset') ? styles.inputError : ''}`}
								disabled={isLoading}
							/>
							{error.type.includes('reset') && (
								<div className={styles.fieldErrorIndicator}>
									<span>⚠️</span>
								</div>
							)}
						</div>

						<div className={styles.resetActions}>
							<button
								type="submit"
								className={`${styles.button} ${isLoading ? styles.buttonLoading : ''}`}
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<span className={styles.spinner}></span>
										Sending...
									</>
								) : (
									'Send Reset Link'
								)}
							</button>

							<button
								type="button"
								onClick={() => {
									setShowResetForm(false);
									setError({ type: '', message: '' });
								}}
								className={styles.secondaryButton}
								disabled={isLoading}
							>
								Back to Login
							</button>
						</div>

						{error.message && error.type.includes('reset') && (
							<div className={styles.error}>
								<div className={styles.errorIcon}>⚠️</div>
								<div className={styles.errorContent}>
									<div className={styles.errorTitle}>
										{error.type === 'reset_user_not_found' &&
											'Account Not Found'}
										{error.type === 'reset_empty_email' && 'Email Required'}
										{error.type === 'reset_invalid_email' && 'Invalid Email'}
										{error.type === 'reset_failed' && 'Reset Failed'}
									</div>
									<div className={styles.errorMessage}>{error.message}</div>
								</div>
							</div>
						)}

						{successMessage && (
							<div className={styles.success}>
								<div className={styles.successIcon}>✅</div>
								<div className={styles.successContent}>
									<div className={styles.successTitle}>Email Sent!</div>
									<div className={styles.successMessage}>{successMessage}</div>
								</div>
							</div>
						)}
					</form>
				)}
			</div>
		</div>
	);
}
