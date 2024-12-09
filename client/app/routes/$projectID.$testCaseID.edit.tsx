import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import { useLoaderData, useNavigate, useSubmit } from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import { TestCaseForm, TestCaseFormMode } from '~/components/TestCaseForm'
import {
	CreateTestCase,
	FetchResponse,
	PropertyConfiguration,
	TestCase,
	UpdateRequestBody,
} from '~/models/types'
import { useEffect } from 'react'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectID = params.projectID!
	const testCaseID = params.testCaseID!

	// Fetch properties
	const propertiesResponse = await fetch(APIRoute.properties, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!propertiesResponse.ok) {
		throw new Error('Failed to fetch properties')
	}

	const properties = (await propertiesResponse.json()) as FetchResponse<
		PropertyConfiguration[]
	>

	// Fetch all test cases
	const testCasesResponse = await fetch(APIRoute.testCases(projectID), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!testCasesResponse.ok) {
		throw new Error('Failed to fetch test cases')
	}

	const testCases = (await testCasesResponse.json()) as FetchResponse<
		TestCase[]
	>
	const testCase = testCases.data.find(
		(testCase) => testCase.testCaseID === testCaseID
	)

	if (!testCase) {
		throw new Response('Test case not found', { status: 404 })
	}

	return {
		testCase,
		properties: properties.data,
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	const projectID = params.projectID!
	const testCaseID = params.testCaseID!

	const response = await fetch(APIRoute.testCases(projectID), {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: await request.text(),
	})

	if (!response.ok) {
		throw new Response('Failed to update test case', {
			status: response.status,
		})
	}

	return redirect(Route.viewTestCase(projectID, testCaseID))
}

export default function EditTestCase() {
	const navigate = useNavigate()
	const submit = useSubmit()
	const { testCase, properties } = useLoaderData<typeof loader>()

	function handleSubmit(testCaseUpdate: CreateTestCase) {
		const updateBody: UpdateRequestBody<CreateTestCase> = {
			id: testCase.testCaseID,
			data: testCaseUpdate,
		}

		submit(updateBody, {
			method: 'POST',
			encType: 'application/json',
		})
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					Edit Test Case
				</h2>
			</div>

			<TestCaseForm
				properties={properties}
				defaultValues={testCase}
				mode={TestCaseFormMode.edit}
				onCancel={() =>
					navigate(
						Route.viewTestCase(testCase.projectID, testCase.testCaseID)
					)
				}
				onSubmit={handleSubmit}
			/>
		</div>
	)
}
