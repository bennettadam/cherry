import { json, type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useRouteLoaderData, useNavigate } from '@remix-run/react'
import type { loader as projectLoader } from './$projectID'
import { build } from 'vite'
import { APIRoute, Route } from '../utility/Routes'
import { Form } from '@remix-run/react'

export async function action({ request, params }: ActionFunctionArgs) {
	const projectID = params.projectID
	if (!projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const formData = await request.formData()
	const data = {
		// required
		title: formData.get('title')?.toString() ?? '',
		// optional
		description: formData.get('description')?.toString(),
		testInstructions: formData.get('testInstructions')?.toString(),
	}

	const response = await fetch(APIRoute.testCases(projectID), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
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
	const routeData =
		useRouteLoaderData<typeof projectLoader>('routes/$projectID')

	if (!routeData?.project) {
		return <p>No project found</p>
	}
	const project = routeData.project

	return (
		<div className="m-8">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Test Case
				</h2>
			</div>
			<div className="rounded-lg border-gray-200 bg-white">
				<Form method="post" className="space-y-6">
					{/* Title Field */}
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
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							placeholder="Enter test case title"
						/>
					</div>

					{/* Description Field */}
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
							rows={3}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							placeholder="Enter test case description"
						/>
					</div>

					{/* Steps Section */}
					<div>
						<label
							htmlFor="testInstructions"
							className="block text-sm font-medium text-gray-700"
						>
							Test Instructions
						</label>
						<div className="space-y-2">
							<textarea
								name="testInstructions"
								id="testInstructions"
								rows={5}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								placeholder="1. Navigate to login page&#10;2. Enter credentials&#10;3. Click login button&#10;4. Verify dashboard is displayed"
							/>
							<p className="text-xs text-gray-500">
								Enter the instructions for the test
							</p>
						</div>
					</div>

					<div className="flex justify-end space-x-3">
						<button
							type="button"
							onClick={() =>
								navigate(Route.viewTests(project.projectID))
							}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
						>
							Create
						</button>
					</div>
				</Form>
			</div>
		</div>
	)
}
