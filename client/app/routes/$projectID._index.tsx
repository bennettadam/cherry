import { useLoaderData, useRouteLoaderData } from '@remix-run/react'
import type { loader as projectLoader } from './$projectID'

export default function ProjectIndex() {
	const routeData =
		useRouteLoaderData<typeof projectLoader>('routes/$projectID')

	if (routeData?.project === undefined) {
		return <p>No project found</p>
	}
	const { project } = routeData

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
				<p className="mt-2 text-gray-600">
					Project created on{' '}
					{new Date(project.creationDate).toLocaleDateString()}
				</p>
			</div>
			<div className="grid grid-cols-2 gap-6">
				<div className="rounded-lg border border-gray-200 p-4">
					<h3 className="text-sm font-medium text-gray-900">Test Cases</h3>
					<p className="mt-1 text-2xl font-semibold text-gray-900">0</p>
				</div>
				<div className="rounded-lg border border-gray-200 p-4">
					<h3 className="text-sm font-medium text-gray-900">Test Runs</h3>
					<p className="mt-1 text-2xl font-semibold text-gray-900">0</p>
				</div>
			</div>
		</div>
	)
}
