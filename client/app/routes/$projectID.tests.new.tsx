import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import {
	useRouteLoaderData,
	useNavigate,
	useLoaderData,
	useSubmit,
} from '@remix-run/react'
import type { loader as projectLoader } from '~/routes/$projectID'
import { APIRoute, Route } from '~/utility/Routes'
import { TestCaseForm, TestCaseFormMode } from '~/components/TestCaseForm'
import {
	CreateTestCase,
	FetchResponse,
	PropertyConfiguration,
} from '~/models/types'

export async function loader({ params }: LoaderFunctionArgs) {
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
	return json({ properties: properties.data })
}

export async function action({ request, params }: ActionFunctionArgs) {
	const projectID = params.projectID
	if (!projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.testCases(projectID), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: await request.text(),
	})

	if (!response.ok) {
		throw new Response('Failed to create test case', {
			status: response.status,
		})
	}

	return redirect(Route.viewTests(projectID))
}

export default function NewTestCase() {
	const navigate = useNavigate()
	const submit = useSubmit()
	const { properties } = useLoaderData<typeof loader>()
	const routeData =
		useRouteLoaderData<typeof projectLoader>('routes/$projectID')

	if (!routeData?.project) {
		return <p>No project found</p>
	}
	const project = routeData.project

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Test Case
				</h2>
			</div>
			<div className="rounded-lg border-gray-200 bg-white">
				<TestCaseForm
					properties={properties}
					mode={TestCaseFormMode.create}
					onCancel={() => navigate(Route.viewTests(project.projectID))}
					onSubmit={(testCase) => {
						submit(testCase, {
							method: 'POST',
							encType: 'application/json',
						})
					}}
				/>
			</div>
		</div>
	)
}
