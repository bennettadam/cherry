import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useNavigate, useOutletContext, useSubmit } from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import { TestCaseForm, TestCaseFormMode } from '~/components/TestCaseForm'
import {
	CreateTestCase,
	ProjectTestCaseOutletContext,
	UpdateRequestBody,
} from '~/models/types'

export async function action({ request, params }: ActionFunctionArgs) {
	const projectShortCode = params.projectShortCode
	const testCaseNumber = Number(params.testCaseNumber)
	if (!projectShortCode) {
		throw new Response('Project short code is required', { status: 400 })
	}
	if (!testCaseNumber) {
		throw new Response('Test case number is required', { status: 400 })
	}

	const response = await fetch(APIRoute.testCases(projectShortCode), {
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

	return redirect(Route.viewTestCase(projectShortCode, testCaseNumber))
}

export default function EditTestCase() {
	const navigate = useNavigate()
	const submit = useSubmit()

	const { testCase, properties } =
		useOutletContext<ProjectTestCaseOutletContext>()

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
		<div>
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
						Route.legacyViewTestCase(
							testCase.projectID,
							testCase.testCaseID
						)
					)
				}
				onSubmit={handleSubmit}
			/>
		</div>
	)
}
