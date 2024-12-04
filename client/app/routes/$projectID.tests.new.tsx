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
} from '@remix-run/react'
import type { loader as projectLoader } from './$projectID'
import { build } from 'vite'
import { APIRoute, Route } from '../utility/Routes'
import { Form } from '@remix-run/react'
import {
	FetchResponse,
	PropertyConfiguration,
	PropertyType,
} from '../models/types'

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

					{/* Properties Section */}
					<div>
						<h3 className="block text-sm font-medium text-gray-700 mb-3">
							Properties
						</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{properties.map((property) => (
								<div
									key={property.propertyConfigurationID}
									className="rounded-md border border-gray-200 p-3"
								>
									<div className="font-medium text-gray-900">
										{property.name}
									</div>
									{property.propertyType === PropertyType.text && (
										<input
											type="text"
											name={`property_${property.propertyConfigurationID}`}
											className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
											placeholder={`Enter ${property.name}`}
										/>
									)}
									{property.propertyType === PropertyType.number && (
										<input
											type="number"
											name={`property_${property.propertyConfigurationID}`}
											className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
											placeholder={`Enter ${property.name}`}
										/>
									)}
									{property.propertyType === PropertyType.enum &&
										property.enumOptions && (
											<select
												name={`property_${property.propertyConfigurationID}`}
												className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
											>
												{property.enumOptions.map((option) => (
													<option key={option} value={option}>
														{option}
													</option>
												))}
											</select>
										)}
								</div>
							))}
						</div>
					</div>

					{/* Test Instructions Section */}
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
