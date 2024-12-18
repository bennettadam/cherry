import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Link, useNavigate, useParams } from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import { TestRun, TestRunStatus } from '~/models/types'
import type { FetchResponse } from '~/models/types'

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.testRuns(params.projectID), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch test runs', { status: 500 })
	}

	const data = (await response.json()) as FetchResponse<TestRun[]>
	return { testRuns: data.data }
}

export default function TestRunsIndex() {
	const { testRuns } = useLoaderData<typeof loader>()
	const { projectID } = useParams()

	if (!projectID) {
		return <div>Project ID is required</div>
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						Test Runs
					</h1>
					<p className="mt-2 text-gray-600">
						View all test runs for this project
					</p>
				</div>

				<Link
					to={Route.newTestRun(projectID)}
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					Create Test Run
				</Link>
			</div>
			<div className="overflow-hidden rounded-lg border border-gray-200">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Title
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Status
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Start Time
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Duration
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
								Tests
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200 bg-white">
						{testRuns.map((testRun) => (
							<tr key={testRun.testRunID}>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
									<Link
										to={`${testRun.testRunID}`}
										className="text-blue-600 hover:text-blue-800 hover:underline"
									>
										{testRun.title}
									</Link>
								</td>
								<td className="whitespace-nowrap px-6 py-4">
									{createStatusSpan(testRun.status)}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
									{new Date(testRun.creationDate).toLocaleString()}
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
									-
								</td>
								<td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
									-
								</td>
							</tr>
						))}
						{testRuns.length === 0 && (
							<tr>
								<td
									colSpan={5}
									className="px-6 py-4 text-center text-sm text-gray-500"
								>
									No test runs found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}

function createStatusSpan(status: TestRunStatus) {
	switch (status) {
		case TestRunStatus.pending:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-gray-100 text-gray-800">
					{status}
				</span>
			)
		case TestRunStatus.abort:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-red-100 text-red-800">
					{status}
				</span>
			)
		case TestRunStatus.complete:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800">
					{status}
				</span>
			)
	}
}
