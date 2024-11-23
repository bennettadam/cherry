import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	useLoaderData,
	Link,
	useRouteLoaderData,
	useParams,
} from '@remix-run/react'
import { loader as testLoader } from '~/routes/$projectID.tests._index'
import { APIRoute } from '../utility/Routes'
import { FetchResponse, TestCase } from '../models/types'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectID = params.projectID
	if (!projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}
	const testCaseID = params.testCaseID
	if (!testCaseID) {
		throw new Response('Test case ID is required', { status: 400 })
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

	const testCases = (await response.json()) as FetchResponse<TestCase>
	const testCase = testCases.data.find(
		(testCase) => testCase.testCaseID === testCaseID
	)

	if (!testCase) {
		throw new Response('Test case not found', { status: 404 })
	}

	return { testCase }
}

export default function TestCaseDetails() {
	const { testCase } = useLoaderData<typeof loader>()

	return (
		<div className="p-6">
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-gray-900">
						{testCase.title}
					</h2>
					<Link
						to="edit"
						className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						Edit Test Case
					</Link>
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-4">
					<span className="text-sm text-gray-500">
						Test Case #{testCase.testCaseNumber}
					</span>
					<span className="text-sm text-gray-500">
						Created:{' '}
						{new Date(testCase.creationDate).toLocaleDateString()}
					</span>
					<span className="text-sm text-gray-500">
						ID: {testCase.testCaseID}
					</span>
					<span className="text-sm text-gray-500">
						Project ID: {testCase.projectID}
					</span>
				</div>
			</div>

			<div className="space-y-4">
				{testCase.description && (
					<div className="rounded-lg border border-gray-200 p-4">
						<h3 className="text-lg font-medium text-gray-900">
							Description
						</h3>
						<p className="mt-2 text-gray-700">{testCase.description}</p>
					</div>
				)}

				{testCase.testInstructions && (
					<div className="rounded-lg border border-gray-200 p-4">
						<h3 className="text-lg font-medium text-gray-900">
							Test Instructions
						</h3>
						<p className="mt-2 text-gray-700">
							{testCase.testInstructions}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
