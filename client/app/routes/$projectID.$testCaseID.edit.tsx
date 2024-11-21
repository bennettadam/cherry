import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	redirect,
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { projectStore } from '~/models/project.server'
import { Route } from '../utility/Routes'

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

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const projectID = params.projectID!
	const testCaseID = params.testCaseID!

	const updates = {
		title: formData.get('title') as string,
		description: formData.get('description') as string,
		priority: formData.get('priority') as string,
	}

	await projectStore.updateTestCase(projectID, testCaseID, updates)

	return redirect(Route.viewTestCase(projectID, testCaseID))
}

export default function EditTestCase() {
	const { testCase } = useLoaderData<typeof loader>()

	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					Edit Test Case
				</h2>
			</div>

			<Form method="post" className="space-y-6">
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
						defaultValue={testCase.title}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						required
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
						defaultValue={testCase.description}
						rows={4}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
						required
					/>
				</div>

				<div>
					<label
						htmlFor="priority"
						className="block text-sm font-medium text-gray-700"
					>
						Priority
					</label>
					<select
						name="priority"
						id="priority"
						defaultValue={testCase.priority}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</div>

				<div className="flex justify-end gap-4">
					<Link
						to=".."
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</Link>
					<button
						type="submit"
						className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
					>
						Save Changes
					</button>
				</div>
			</Form>
		</div>
	)
}
