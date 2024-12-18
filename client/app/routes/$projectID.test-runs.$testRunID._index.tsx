import { json, type LoaderFunctionArgs } from '@remix-run/node'
import {
	useLoaderData,
	useRouteLoaderData,
	useParams,
	useNavigate,
} from '@remix-run/react'
import { Route, APIRoute } from '~/utility/Routes'
import { TestRun } from '~/models/types'
import type { FetchResponse, TestCaseRun } from '~/models/types'
import { loader as testRunsLoader } from '~/routes/$projectID.test-runs._index'
import { useState } from 'react'

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.projectID || !params.testRunID) {
		throw new Response('Project ID and Test Run ID are required', {
			status: 400,
		})
	}

	// Fetch test case runs
	const testCaseRunsResponse = await fetch(
		APIRoute.testCaseRuns(params.testRunID),
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	)

	if (!testCaseRunsResponse.ok) {
		throw new Response('Failed to fetch test case runs', { status: 500 })
	}

	// Fetch test runs for the project
	const testRunsResponse = await fetch(APIRoute.testRuns(params.projectID), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!testRunsResponse.ok) {
		throw new Response('Failed to fetch test runs', { status: 500 })
	}

	const testCaseRunsData =
		(await testCaseRunsResponse.json()) as FetchResponse<TestCaseRun[]>
	const testRunsData = (await testRunsResponse.json()) as FetchResponse<
		TestRun[]
	>

	const testRun = testRunsData.data.find(
		(testRun) => testRun.testRunID === params.testRunID
	)

	if (!testRun) {
		throw new Response('Test run not found', { status: 404 })
	}

	return {
		testCaseRuns: testCaseRunsData.data,
		testRun,
	}
}

export default function TestRunDetails() {
	const { testCaseRuns, testRun } = useLoaderData<typeof loader>()
	const navigate = useNavigate()

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<h1 className="text-2xl font-semibold text-gray-900">
					{testRun.title}
				</h1>
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-4">Test Cases</h3>
			<table className="min-w-full divide-y divide-gray-200">
				<thead>
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							ID
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Title
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Created
						</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{testCaseRuns.map((testCaseRun) => (
						<tr
							key={testCaseRun.testCaseRunID}
							onClick={() => navigate(testCaseRun.testCaseRunID)}
							className="cursor-pointer hover:bg-gray-50"
						>
							<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
								{testCaseRun.testCase.testCaseNumber}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{testCaseRun.title}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{testCaseRun.status}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
								{new Date(testCaseRun.creationDate).toLocaleString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
