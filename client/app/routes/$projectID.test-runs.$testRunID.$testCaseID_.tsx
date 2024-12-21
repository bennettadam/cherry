import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
} from '@remix-run/node'
import { useLoaderData, Link, useFetcher } from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import {
	FetchResponse,
	TestCaseRun,
	TestCaseRunStatus,
	UpdateRequestBody,
} from '~/models/types'
import { useState } from 'react'

interface UpdateTestCaseRun extends Record<string, any> {
	status: TestCaseRunStatus
}

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.projectID || !params.testRunID || !params.testCaseID) {
		throw new Response(
			'Project ID, Test Run ID, and Test Case ID are required',
			{
				status: 400,
			}
		)
	}

	const response = await fetch(APIRoute.testCaseRuns(params.testRunID), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch test case runs', {
			status: 500,
		})
	}

	const data = (await response.json()) as FetchResponse<TestCaseRun[]>
	const testCaseRun = data.data.find(
		(run) => run.testCaseRunID === params.testCaseID
	)

	if (!testCaseRun) {
		throw new Response('Test case run not found', { status: 404 })
	}

	return { testCaseRun }
}

export async function action({ request, params }: ActionFunctionArgs) {
	const { testRunID, testCaseID } = params

	if (!testRunID || !testCaseID) {
		throw new Response('Test Run ID and Test Case ID are required', {
			status: 400,
		})
	}

	const response = await fetch(APIRoute.testCaseRuns(testRunID), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: await request.text(),
	})

	if (!response.ok) {
		throw new Response('Failed to update test case status', {
			status: 500,
		})
	}

	return { success: true }
}

export default function TestCaseRunDetails() {
	const { testCaseRun } = useLoaderData<typeof loader>()
	const fetcher = useFetcher()
	const [selectedStatus, setSelectedStatus] = useState<TestCaseRunStatus>(
		testCaseRun.status
	)

	const handleStatusUpdate = (status: TestCaseRunStatus) => {
		setSelectedStatus(status)

		const updateBody: UpdateRequestBody<UpdateTestCaseRun> = {
			id: testCaseRun.testCaseRunID,
			data: { status },
		}

		fetcher.submit(updateBody, {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<div className="p-6">
			<Link
				to=".."
				relative="path"
				className="inline-flex items-center mb-4 text-sm text-gray-600 hover:text-gray-900"
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

			<div className="mb-6">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-semibold text-gray-900">
						{testCaseRun.title}
					</h1>
					<Link
						to={Route.legacyViewTestCase(
							testCaseRun.testCase.projectID,
							testCaseRun.testCase.testCaseID
						)}
						className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
					>
						View Original Test Case
					</Link>
				</div>
				<p className="mt-2 text-gray-600">Test Case Run Details</p>
			</div>

			<div className="space-y-8">
				<section className="mt-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Status
					</h2>
					<div className="flex gap-3">
						<button
							type="button"
							onClick={() => handleStatusUpdate(TestCaseRunStatus.pass)}
							className={`px-4 py-2 text-sm font-medium rounded-md ${
								selectedStatus === TestCaseRunStatus.pass
									? 'bg-green-100 text-green-800 ring-1 ring-green-600'
									: 'bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700'
							}`}
						>
							Pass
						</button>
						<button
							type="button"
							onClick={() => handleStatusUpdate(TestCaseRunStatus.fail)}
							className={`px-4 py-2 text-sm font-medium rounded-md ${
								selectedStatus === TestCaseRunStatus.fail
									? 'bg-red-100 text-red-800 ring-1 ring-red-600'
									: 'bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-red-700'
							}`}
						>
							Fail
						</button>
						<button
							type="button"
							onClick={() => handleStatusUpdate(TestCaseRunStatus.skip)}
							className={`px-4 py-2 text-sm font-medium rounded-md ${
								selectedStatus === TestCaseRunStatus.skip
									? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600'
									: 'bg-gray-50 text-gray-700 hover:bg-yellow-50 hover:text-yellow-700'
							}`}
						>
							Skip
						</button>
					</div>
				</section>

				<section>
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Details
					</h2>
					<dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
						<div>
							<dt className="text-sm font-medium text-gray-500">
								Test Case Number
							</dt>
							<dd className="mt-1 text-sm text-gray-900">
								{testCaseRun.testCase.testCaseNumber}
							</dd>
						</div>
						<div>
							<dt className="text-sm font-medium text-gray-500">
								Created
							</dt>
							<dd className="mt-1 text-sm text-gray-900">
								{new Date(testCaseRun.creationDate).toLocaleString()}
							</dd>
						</div>
					</dl>
				</section>

				{testCaseRun.testCase.description && (
					<section>
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Description
						</h2>
						<div className="prose prose-sm max-w-none">
							{testCaseRun.testCase.description}
						</div>
					</section>
				)}

				<section>
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Test Instructions
					</h2>
					<div className="prose prose-sm max-w-none whitespace-pre-wrap">
						{testCaseRun.testCase.testInstructions ||
							'No test instructions available'}
					</div>
				</section>
			</div>
		</div>
	)
}
