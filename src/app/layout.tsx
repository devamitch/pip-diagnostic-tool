/* eslint-disable @next/next/no-sync-scripts */
import { AuthProvider } from '@/provider/AuthProvider';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const APP_NAME = 'Eye Rescue';
const APP_DEFAULT_TITLE = 'Eye Rescue';
const APP_TITLE_TEMPLATE = '%s - PWA App';
const APP_DESCRIPTION = 'Advanced Eye Disease Detection with AI Technology';

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	manifest: '/manifest.json',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: APP_DEFAULT_TITLE,
		// startUpImage: [],
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: 'website',
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: 'summary',
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
};

export const viewport: Viewport = {
	themeColor: '#485953ff',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="stylesheet" href="/css/global.css" />
				<meta name="theme-color" content="#ffffff" />
				<meta name="application-name" content="Eye Rescue" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<script src="/mediapipe/wasm/vision_wasm_internal.js"></script>
				<meta name="mobile-web-app-capable" content="yes"></meta>
				<meta name="apple-mobile-web-app-capable" content="yes"></meta>
			</head>
			<body className={inter.className}>
				<AuthProvider>{children}</AuthProvider>
				<script src="/mediapipe/wasm/vision_wasm_internal.js"></script>
			</body>
		</html>
	);
}
