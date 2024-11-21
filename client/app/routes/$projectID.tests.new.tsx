import { json, type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useRouteLoaderData, useNavigate, useSubmit } from '@remix-run/react'
import type { TestCase } from '~/models/types'
import { projectStore } from '~/models/project.server'
import type { loader as projectLoader } from './$projectID'
import { build } from 'vite'
import { Route } from '../utility/Routes'

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const projectID = params.projectID!

	return redirect(Route.viewTests(projectID))
}

const TEST_CASE_FIELDS = [
	{
		name: 'title',
		label: 'Title',
		type: 'text' as const,
		required: true,
	},
	{
		name: 'description',
		label: 'Description',
		type: 'textarea' as const,
		required: true,
	},
	{
		name: 'priority',
		label: 'Priority',
		type: 'select' as const,
		required: true,
		options: [
			{ value: 'critical', label: 'Critical' },
			{ value: 'high', label: 'High' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'low', label: 'Low' },
		],
	},
	{
		name: 'type',
		label: 'Type',
		type: 'select' as const,
		required: true,
		options: [
			{ value: 'functional', label: 'Functional' },
			{ value: 'smoke', label: 'Smoke' },
			{ value: 'regression', label: 'Regression' },
			{ value: 'security', label: 'Security' },
			{ value: 'acceptance', label: 'Acceptance' },
			{ value: 'compatibility', label: 'Compatibility' },
			{ value: 'exploratory', label: 'Exploratory' },
			{ value: 'other', label: 'Other' },
		],
	},
]

export default function NewTestCase() {
	const navigate = useNavigate()
	const submit = useSubmit()
	const routeData =
		useRouteLoaderData<typeof projectLoader>('routes/$projectID')

	if (!routeData?.project) {
		return <p>No project found</p>
	}
	const project = routeData.project

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		submit(formData, { method: 'POST' })
	}

	const renderField = (field: (typeof TEST_CASE_FIELDS)[number]) => {
		const baseClasses =
			'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'

		switch (field.type) {
			case 'textarea':
				return (
					<textarea
						name={field.name}
						id={field.name}
						rows={3}
						required={field.required}
						className={baseClasses}
					/>
				)
			case 'select':
				return (
					<select
						name={field.name}
						id={field.name}
						required={field.required}
						className={baseClasses}
					>
						{field.options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				)
			default:
				return (
					<input
						type="text"
						name={field.name}
						id={field.name}
						required={field.required}
						className={baseClasses}
					/>
				)
		}
	}

	return (
		<div className="m-8">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Test Case
				</h2>
			</div>
			<div className="rounded-lg border-gray-200 bg-white">
				<form onSubmit={handleSubmit} className="space-y-6">
					{TEST_CASE_FIELDS.map((field) => (
						<div key={field.name}>
							<label
								htmlFor={field.name}
								className="block text-sm font-medium text-gray-700"
							>
								{field.label}
							</label>
							{renderField(field)}
						</div>
					))}

					{/* Steps Section */}
					<div>
						<label
							htmlFor="steps"
							className="block text-sm font-medium text-gray-700"
						>
							Test Steps
						</label>
						<div className="space-y-2">
							<textarea
								name="steps"
								id="steps"
								rows={5}
								required
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								placeholder="1. Navigate to login page&#10;2. Enter credentials&#10;3. Click login button&#10;4. Verify dashboard is displayed"
							/>
							<p className="text-xs text-gray-500">
								Enter each step on a new line, numbered sequentially
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
				</form>
			</div>
		</div>
	)
}
