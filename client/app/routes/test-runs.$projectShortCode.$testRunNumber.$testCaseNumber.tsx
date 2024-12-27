import { type ActionFunctionArgs } from '@remix-run/node'
import {
	Link,
	useActionData,
	useFetcher,
	useOutletContext,
	useParams,
} from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import {
	ProjectTestCaseRunsOutletContext,
	TestCaseRunStatus,
	ErrorResponse,
} from '~/models/types'
import { useState } from 'react'
import { Tools } from '~/utility/Tools'
import { BackButton } from '~/components/BackButton'
import { APIClient } from '../utility/APIClient'
import { ErrorMessage } from '../components/ErrorMessage'

interface UpdateTestCaseRun extends Record<string, any> {
	status: TestCaseRunStatus
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		const { testCaseRunID, testCaseRunUpdate } = await request.json()
		await APIClient.put<void>(APIRoute.testCaseRun(testCaseRunID), {
			body: testCaseRunUpdate,
		})
	} catch (error) {
		return Response.json(Tools.mapErrorToResponse(error), {
			status: 400,
		})
	}
}

export default function TestCaseRunDetails() {
	const params = useParams()
	const testCaseNumber = Number(params.testCaseNumber)
	if (!testCaseNumber) {
		return <p>Test case number is required</p>
	}

	const { project, testCaseRuns } =
		useOutletContext<ProjectTestCaseRunsOutletContext>()
	const testCaseRun = testCaseRuns.find(
		(run) => run.testCase.testCaseNumber === testCaseNumber
	)
	if (!testCaseRun) {
		return <p>Test case run not found</p>
	}

	const actionData = useActionData<ErrorResponse>()

	const fetcher = useFetcher()
	const [selectedStatus, setSelectedStatus] = useState<TestCaseRunStatus>(
		testCaseRun.status
	)

	const handleStatusUpdate = (status: TestCaseRunStatus) => {
		setSelectedStatus(status)

		const testCaseRunUpdate: UpdateTestCaseRun = {
			status,
		}

		fetcher.submit(
			{
				testCaseRunID: testCaseRun.testCaseRunID,
				testCaseRunUpdate,
			},
			{
				method: 'post',
				encType: 'application/json',
			}
		)
	}

	return (
		<div className="p-6">
			<BackButton />

			<div className="mb-6">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-semibold text-gray-900">
						{testCaseRun.title}
					</h1>
					<Link
						to={Route.viewTestCase(
							project.projectShortCode,
							testCaseRun.testCase.testCaseNumber
						)}
						className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
					>
						View{' '}
						{Tools.testCaseDisplayCode(project, testCaseRun.testCase)}
					</Link>
				</div>
				<p className="mt-2 text-gray-600">Test Case Run Details</p>
			</div>

			{actionData && <ErrorMessage message={actionData.message} />}

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
