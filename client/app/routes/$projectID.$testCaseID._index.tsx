import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Link } from '@remix-run/react'
import { projectStore } from '~/models/project.server'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectID = params.projectID!
	const testCaseID = params.testCaseID!
	const testCases = projectStore.getTestCases(projectID)
	const testCase = testCases.find((test) => test.testCaseID === testCaseID)

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
				<div className="mt-2 flex items-center space-x-4">
					<span className="text-sm font-medium text-gray-500">
						Priority: {testCase.priority.toUpperCase()}
					</span>
					<span className="text-sm text-gray-500">
						Created: {new Date(testCase.createdAt).toLocaleDateString()}
					</span>
				</div>
			</div>

			<div className="rounded-lg border border-gray-200 p-4">
				<h3 className="text-lg font-medium text-gray-900">Description</h3>
				<p className="mt-2 text-gray-700">{testCase.description}</p>
			</div>
		</div>
	)
}
