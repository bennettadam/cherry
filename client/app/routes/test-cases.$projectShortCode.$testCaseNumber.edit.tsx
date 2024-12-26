import { type ActionFunctionArgs, redirect, json } from '@remix-run/node'
import {
	useActionData,
	useNavigate,
	useOutletContext,
	useSubmit,
} from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import { TestCaseForm, TestCaseFormMode } from '~/components/TestCaseForm'
import {
	CreateTestCase,
	ErrorResponse,
	TestCaseOutletContext,
} from '~/models/types'
import { APIClient } from '~/utility/APIClient'
import { Tools } from '~/utility/Tools'

export async function action({ request, params }: ActionFunctionArgs) {
	try {
		const projectShortCode = params.projectShortCode
		const testCaseNumber = Number(params.testCaseNumber)
		if (!projectShortCode) {
			throw 'Project short code is required'
		}
		if (!testCaseNumber) {
			throw 'Test case number is required'
		}

		if (request.method === 'DELETE') {
			const { testCaseID } = await request.json()
			await APIClient.delete(APIRoute.testCase(testCaseID))
			return redirect(Route.viewProjectTestCases(projectShortCode))
		} else if (request.method === 'PUT') {
			const { testCaseID, testCaseUpdate } = await request.json()
			await APIClient.put(APIRoute.testCase(testCaseID), {
				body: testCaseUpdate,
			})
			return redirect(Route.viewTestCase(projectShortCode, testCaseNumber))
		} else {
			throw 'Invalid request method'
		}
	} catch (error) {
		return Response.json(Tools.mapErrorToResponse(error), { status: 400 })
	}
}

export default function EditTestCase() {
	const navigate = useNavigate()
	const submit = useSubmit()
	const { testCase, properties } = useOutletContext<TestCaseOutletContext>()
	const actionData = useActionData<ErrorResponse>()

	function handleSubmit(testCaseUpdate: CreateTestCase) {
		submit(
			{
				testCaseID: testCase.testCaseID,
				testCaseUpdate,
			},
			{
				method: 'PUT',
				encType: 'application/json',
			}
		)
	}

	async function handleDelete() {
		if (confirm('Are you sure you want to delete this test case?')) {
			submit(
				{ testCaseID: testCase.testCaseID },
				{ method: 'DELETE', encType: 'application/json' }
			)
		}
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
				onCancel={() => navigate('..')}
				onSubmit={handleSubmit}
				error={actionData?.message}
				onDelete={handleDelete}
			/>
		</div>
	)
}
