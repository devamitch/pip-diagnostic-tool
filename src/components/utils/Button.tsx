'use client';
import React from 'react';
import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'link';
	size?: 'sm' | 'md' | 'lg';
	fullWidth?: boolean;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	loading?: boolean;
};

const Button: React.FC<ButtonProps> = ({
	variant = 'primary',
	size = 'md',
	fullWidth,
	leftIcon,
	rightIcon,
	loading,
	className,
	children,
	disabled,
	...props
}) => {
	const cls = [
		styles.button,
		styles[variant],
		styles[size],
		fullWidth ? styles.fullWidth : '',
		loading || disabled ? styles.disabled : '',
		className || '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<button className={cls} disabled={loading || disabled} {...props}>
			{leftIcon ? <span className={styles.icon}>{leftIcon}</span> : null}
			<span>{loading ? 'Loading...' : children}</span>
			{rightIcon ? <span className={styles.icon}>{rightIcon}</span> : null}
		</button>
	);
};

export default Button;
