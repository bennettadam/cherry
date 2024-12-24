import { Link } from '@remix-run/react'

export function BackButton() {
	return (
		<Link
			to=".."
			className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
		>
			<svg
				className="w-4 h-4 mr-1"
				fill="none"
				strokeWidth="2"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
				/>
			</svg>
			Back
		</Link>
	)
}
