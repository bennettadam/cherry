import { Link, useNavigate } from '@remix-run/react'

export function BackButton() {
	const navigate = useNavigate()

	return (
		<button
			// we need to be careful about using navigate(-1)
			// it works when linking from a test case run to the original test case, (pressing back returns to test case run)
			// however under normal operation it doesn't work well. for example if i just edited a test case, pressed save, and then hit back
			// it will return to the edit page, instead of taking me back to the list of all test cases
			// maybe we can add logic to determine if we should use ".." or "-1"
			onClick={() => navigate('..')}
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
		</button>
	)
}
