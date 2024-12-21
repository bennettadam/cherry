import { type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useOutletContext } from '@remix-run/react'
import { APIRoute } from '~/utility/Routes'
import {
	FetchResponse,
	ProjectTestCasesOutletContext,
	TestCase,
} from '~/models/types'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.projectTestCases(projectShortCode), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch test cases', { status: 500 })
	}

	const testCases = (await response.json()) as FetchResponse<TestCase[]>

	return { testCases: testCases.data }
}

export default function TestCasesIndex() {
	const { testCases } = useOutletContext<ProjectTestCasesOutletContext>()

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">Test Cases</h2>
				<Link
					to="new"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					New Test Case
				</Link>
			</div>

			{testCases.length === 0 ? (
				<div className="p-4 text-sm text-gray-500">
					No test cases created yet.
				</div>
			) : (
				<ul className="divide-y divide-gray-200">
					{testCases.map((testCase) => (
						<li key={testCase.testCaseID}>
							<Link
								to={testCase.testCaseNumber.toString()}
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
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
