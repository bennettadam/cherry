import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import {
	Form,
	useNavigate,
	useOutletContext,
	useSubmit,
} from '@remix-run/react'
import { Route, APIRoute } from '~/utility/Routes'
import type {
	ProjectTestCaseRunsOutletContext,
	UpdateTestRun,
} from '~/models/types'
import { useState } from 'react'
import { APIClient } from '~/utility/APIClient'

export async function action({ request, params }: ActionFunctionArgs) {
	const projectShortCode = params.projectShortCode
	const testRunNumber = Number(params.testRunNumber)
	if (!projectShortCode) {
		throw new Response('Project short code is required', { status: 400 })
	}
	if (!testRunNumber) {
		throw new Response('Test run number is required', { status: 400 })
	}

	const { testRunID, testRunUpdate } = await request.json()
	await APIClient.put<void>(APIRoute.testRun(testRunID), {
		body: testRunUpdate,
	})

	return redirect(Route.viewTestRun(projectShortCode, testRunNumber))
}

export default function EditTestRun() {
	const { testRun } = useOutletContext<ProjectTestCaseRunsOutletContext>()

	const navigate = useNavigate()
	const submit = useSubmit()
	const [error, setError] = useState<string>()

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const title = formData.get('title')
		const description = formData.get('description')

		if (!title) {
			setError('Title is required')
			return
		}

		const testRunUpdate: UpdateTestRun = {
			title: title.toString(),
			description: description?.toString(),
			status: testRun.status,
		}

		submit(
			{
				testRunID: testRun.testRunID,
				testRunUpdate,
			},
			{
				method: 'post',
				encType: 'application/json',
			}
		)
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">
					Edit Test Run
				</h1>
			</div>

			<Form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
				{error && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="ml-3">
								<h3 className="text-sm font-medium text-red-800">
									{error}
								</h3>
							</div>
						</div>
					</div>
				)}

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
						defaultValue={testRun.title}
						required
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
						defaultValue={testRun.description}
						rows={4}
						className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					/>
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={() => navigate('..')}
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
					>
						Save Changes
					</button>
				</div>
			</Form>
		</div>
	)
}
