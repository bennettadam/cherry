import { json, type ActionFunctionArgs, redirect } from '@remix-run/node'
import {
	Form,
	useNavigate,
	useParams,
	useLoaderData,
	useSubmit,
} from '@remix-run/react'
import { APIRoute } from '~/utility/Routes'
import { useState } from 'react'
import type {
	FetchResponse,
	PropertyConfiguration,
	TestCase,
} from '~/models/types'
import TestCaseSelector from '~/components/TestCaseSelector'
import { Route } from '~/utility/Routes'

interface CreateTestRun extends Record<string, any> {
	title: string
	description?: string
	testCaseIDs: string[]
}

export async function loader({ params }: ActionFunctionArgs) {
	const [propertiesResponse, testCasesResponse] = await Promise.all([
		fetch(APIRoute.properties),
		fetch(APIRoute.testCases(params.projectID!)),
	])

	if (!propertiesResponse.ok || !testCasesResponse.ok) {
		throw new Response('Failed to fetch data', { status: 500 })
	}

	const properties = (await propertiesResponse.json()) as FetchResponse<
		PropertyConfiguration[]
	>
	const testCases = (await testCasesResponse.json()) as FetchResponse<
		TestCase[]
	>

	return json({ properties: properties.data, testCases: testCases.data })
}

export async function action({ request, params }: ActionFunctionArgs) {
	if (!params.projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.testRuns(params.projectID), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: await request.text(),
	})

	if (!response.ok) {
		throw new Response('Failed to create test run', { status: 500 })
	}

	return redirect(Route.viewTestRuns(params.projectID))
}

export default function NewTestRun() {
	const navigate = useNavigate()
	const { properties, testCases } = useLoaderData<typeof loader>()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [showTestCaseSelector, setShowTestCaseSelector] = useState(false)
	const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([])
	const submit = useSubmit()

	const todayDateString = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
	})
	const defaultTitle = `${todayDateString} Test Run`

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSubmitting(true)

		const formData = new FormData(event.currentTarget)
		const jsonData: CreateTestRun = {
			title: formData.get('title') as string,
			description: formData.get('description') as string | undefined,
			testCaseIDs: selectedTestCases.map((tc) => tc.testCaseID),
		}

		submit(jsonData, {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">
					{showTestCaseSelector
						? 'Select Test Cases'
						: 'Create New Test Run'}
				</h1>
			</div>

			{showTestCaseSelector ? (
				<div className="space-y-6">
					<TestCaseSelector
						properties={properties}
						testCases={testCases}
						onDone={(testCases) => {
							setSelectedTestCases(testCases)
							setShowTestCaseSelector(false)
						}}
						initialSelectedTestCases={selectedTestCases}
					/>
				</div>
			) : (
				<Form method="post" className="space-y-6" onSubmit={handleSubmit}>
					<div className="max-w-2xl">
						<div className="space-y-6">
							<div>
								<label
									htmlFor="title"
									className="block text-sm font-medium text-gray-700"
								>
									Title
								</label>
								<input
									type="text"
									name="title"
									id="title"
									required
									defaultValue={defaultTitle}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								/>
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-sm font-medium text-gray-700"
								>
									Description
								</label>
								<textarea
									name="description"
									id="description"
									rows={4}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								/>
							</div>
						</div>
					</div>

					<div>
						<button
							type="button"
							onClick={() => setShowTestCaseSelector(true)}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							{selectedTestCases.length > 0
								? `Selected Test Cases (${selectedTestCases.length})`
								: 'Select Test Cases'}
						</button>
					</div>

					<div className="flex justify-end gap-3">
						<button
							type="button"
							onClick={() => navigate(-1)}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
						>
							{isSubmitting ? 'Creating...' : 'Create Test Run'}
						</button>
					</div>
				</Form>
			)}
		</div>
	)
}
