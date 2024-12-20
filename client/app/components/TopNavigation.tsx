import { Link } from '@remix-run/react'
import { Route } from '~/utility/Routes'

export default function TopNavigation() {
	return (
		<div className="border-b border-gray-200 bg-white">
			<div className="flex h-14 items-center px-4">
				<div className="flex items-center">
					<h1 className="text-xl font-semibold text-gray-900">Cherry</h1>
					<nav className="ml-8 flex space-x-4">
						<Link
							to="/"
							className="text-sm font-medium text-gray-700 hover:text-sky-600"
						>
							Projects
						</Link>
						<Link
							to={Route.viewProperties}
							className="text-sm font-medium text-gray-700 hover:text-sky-600"
						>
							Configuration
						</Link>
					</nav>
				</div>
			</div>
		</div>
	)
}
