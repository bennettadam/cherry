import { json, type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useNavigate, useSubmit, Form, useActionData } from '@remix-run/react'
import { APIRoute, Route } from '~/utility/Routes'
import { NewProject } from '~/models/project'
import type { ErrorResponse } from '~/models/types'
import { ErrorMessage } from '~/components/ErrorMessage'
import { Tools } from '~/utility/Tools'
import { APIClient } from '~/utility/APIClient'

export async function action({ request }: ActionFunctionArgs) {
	try {
		await APIClient.post(APIRoute.projects, {
			body: await request.json(),
		})

		return redirect(Route.index)
	} catch (error) {
		return Response.json(Tools.mapErrorToResponse(error), { status: 400 })
	}
}

export default function NewProjectPage() {
	const navigate = useNavigate()
	const submit = useSubmit()
	const actionData = useActionData<ErrorResponse>()

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const formData = new FormData(e.currentTarget)
		const projectData: NewProject = {
			title: formData.get('title') as string,
			projectShortCode: formData.get('shortCode') as string,
			description: formData.get('description') as string | undefined,
		}

		submit(projectData, {
			method: 'post',
			encType: 'application/json',
		})
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">
					New Project
				</h2>
			</div>
			{actionData?.message && <ErrorMessage message={actionData.message} />}
			<div>
				<Form method="post" className="space-y-4" onSubmit={handleSubmit}>
					<div>
						<label
							htmlFor="title"
							className="block text-sm font-medium text-gray-700"
						>
							Project Name
						</label>
						<input
							type="text"
							name="title"
							id="title"
							required
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
					</div>
					<div>
						<label
							htmlFor="shortCode"
							className="block text-sm font-medium text-gray-700"
						>
							Project Short Code
						</label>
						<input
							type="text"
							name="shortCode"
							id="shortCode"
							// required
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							onInput={(e) => {
								const input = e.currentTarget
								input.value = input.value.toUpperCase()
							}}
							onKeyDown={(e) => {
								if (!/[A-Z0-9]/.test(e.key.toUpperCase())) {
									e.preventDefault()
								}
							}}
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
							rows={3}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						/>
					</div>
					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={() => navigate('..')}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
						>
							Create
						</button>
					</div>
				</Form>
			</div>
		</div>
	)
}
