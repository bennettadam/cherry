import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	redirect,
} from '@remix-run/node'
import {
	useLoaderData,
	useRouteLoaderData,
	useParams,
	useNavigate,
	useSubmit,
} from '@remix-run/react'
import { Route, APIRoute } from '~/utility/Routes'
import { TestRun, TestRunStatus } from '~/models/types'
import type {
	FetchResponse,
	TestCaseRun,
	UpdateRequestBody,
	UpdateTestRun,
} from '~/models/types'
import { loader as testRunsLoader } from '~/routes/$projectID.test-runs._index'
import { useState } from 'react'
import { ActionMenu, type ActionMenuItem } from '~/components/ActionMenu'
import { TestRunStatusBadge } from '~/components/TestRunStatusBadge'
import { TestCaseRunStatusBadge } from '~/components/TestCaseRunStatusBadge'

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
		projectID: params.projectID,
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	const projectID = params.projectID
	const testRunID = params.testRunID
	if (!projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}
	if (!testRunID) {
		throw new Response('Test Run ID is required', { status: 400 })
	}

	const { intent, testRunUpdate } = await request.json()

	if (intent === 'abort') {
		const response = await fetch(APIRoute.testRunByID(testRunID), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(testRunUpdate),
		})

		if (!response.ok) {
			throw new Response('Failed to abort test run', { status: 500 })
		}

		return redirect(Route.viewTestRuns(projectID))
	}

	if (intent === 'delete') {
		const response = await fetch(APIRoute.testRunByID(testRunID), {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Response('Failed to delete test run', { status: 500 })
		}

		return redirect(Route.viewTestRuns(projectID))
	}

	throw new Response('Invalid request', { status: 400 })
}

export default function TestRunDetails() {
	const { testCaseRuns, testRun, projectID } = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const submit = useSubmit()

	const menuItems: ActionMenuItem[] = (() => {
		const deleteItem: ActionMenuItem = {
			label: 'Delete test run',
			action: () => {
				if (
					window.confirm(
						'Are you sure you want to delete this test run? This action cannot be undone.'
					)
				) {
					submit(
						{ intent: 'delete' },
						{
							method: 'POST',
							encType: 'application/json',
						}
					)
				}
			},
			variant: 'danger',
		}

		const editItem: ActionMenuItem = {
			label: 'Edit test run',
			action: () => {
				navigate(Route.editTestRun(projectID, testRun.testRunID))
			},
		}

		switch (testRun.status) {
			case TestRunStatus.pending:
			case TestRunStatus.inProgress:
				return [
					{
						label: 'Abort test run',
						action: () => {
							const testRunUpdate: UpdateRequestBody<UpdateTestRun> = {
								id: testRun.testRunID,
								data: {
									title: testRun.title,
									description: testRun.description,
									status: TestRunStatus.abort,
								},
							}

							submit(
								{ intent: 'abort', testRunUpdate },
								{
									method: 'POST',
									encType: 'application/json',
								}
							)
						},
					},
					editItem,
					deleteItem,
				]
			case TestRunStatus.abort:
				return [
					{
						label: 'Resume test run',
						action: () => {
							const testRunUpdate: UpdateRequestBody<UpdateTestRun> = {
								id: testRun.testRunID,
								data: {
									title: testRun.title,
									description: testRun.description,
									status: TestRunStatus.pending,
								},
							}

							submit(
								{ intent: 'abort', testRunUpdate },
								{
									method: 'POST',
									encType: 'application/json',
								}
							)
						},
					},
					editItem,
					deleteItem,
				]
			case TestRunStatus.complete:
				return [editItem, deleteItem]
			default:
				return [editItem, deleteItem]
		}
	})()

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						{testRun.title}
					</h1>
					<div className="mt-4 grid grid-cols-2 gap-4">
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Status
							</h3>
							<TestRunStatusBadge status={testRun.status} />
						</div>
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Description
							</h3>
							<p className="text-gray-700 mb-4">
								{testRun.description || 'No description provided'}
							</p>
						</div>
					</div>
				</div>
				<ActionMenu items={menuItems} label="Test Run Settings" />
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
								<TestCaseRunStatusBadge status={testCaseRun.status} />
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
