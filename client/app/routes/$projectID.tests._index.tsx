import { type LoaderFunctionArgs } from '@remix-run/node'
import { useRouteLoaderData, useLoaderData, Link } from '@remix-run/react'
import type { loader as projectLoader } from './$projectID'
import { APIRoute, Route } from '../utility/Routes'
import { FetchResponse, TestCase } from '../models/types'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectID = params.projectID
	if (!projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.testCases(projectID), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch test cases', { status: 500 })
	}

	return (await response.json()) as FetchResponse<TestCase>
}

export default function TestCases() {
	const routeData =
		useRouteLoaderData<typeof projectLoader>('routes/$projectID')
	const { data } = useLoaderData<typeof loader>()

	if (!routeData?.project) {
		return <p>No project found</p>
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">Test Cases</h2>
				<Link
					to="new"
					className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				>
					New Test Case
				</Link>
			</div>
			<div className="rounded-lg border border-gray-200">
				{data.length === 0 ? (
					<div className="p-4 text-sm text-gray-500">
						No test cases created yet.
					</div>
				) : (
					<ul className="divide-y divide-gray-200">
						{data.map((testCase) => (
							<li key={testCase.testCaseID}>
								<Link
									to={Route.viewTestCase(
										testCase.projectID,
										testCase.testCaseID
									)}
									className="block p-4 hover:bg-gray-50"
								>
									<div className="flex items-start justify-between">
										<div>
											<h3 className="text-sm font-medium text-gray-900">
												{testCase.title}
											</h3>
											<p className="mt-1 text-sm text-gray-500">
												{testCase.description}
											</p>
										</div>
										{/* <div className="flex items-center space-x-4">
											<span className="text-xs font-medium text-gray-500">
												{testCase.priority.toUpperCase()}
											</span>
											<span className="text-xs text-gray-500">
												{new Date(
													testCase.createdAt
												).toLocaleDateString()}
											</span>
										</div> */}
									</div>
								</Link>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	)
}
