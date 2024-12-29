import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from '@remix-run/react'
import TopNavigation from '~/components/TopNavigation'

import './tailwind.css'

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<title>Cherry</title>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	)
}

export function links() {
	return [
		{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '16x16',
			href: '/favicon-16x16.png',
		},
		{
			rel: 'icon',
			type: 'image/png',
			sizes: '32x32',
			href: '/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
	]
}

export default function App() {
	return (
		<div className="flex h-screen flex-col">
			<TopNavigation />
			<Outlet />
		</div>
	)
}
