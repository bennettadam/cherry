import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import type { FetchResponse } from '~/models/types'
import { APIRoute, Route } from '~/utility/Routes'
import { Project } from '~/models/project'
import { Column, Table } from '~/components/Table'
import { DateDisplay } from '~/components/DateDisplay'
import { Tools } from '~/utility/Tools'
import { APIClient } from '../utility/APIClient'

export async function loader({ request }: LoaderFunctionArgs) {
	try {
		const fetchResponse = await APIClient.get<FetchResponse<Project[]>>(
			APIRoute.projects
		)
		return fetchResponse
	} catch (error) {
		return Response.json(Tools.mapErrorToResponse(error), { status: 400 })
	}
}

export default function Projects() {
	const navigate = useNavigate()
	const { data } = useLoaderData<typeof loader>()

	const columns: Column<Project>[] = [
		{
			header: 'Project Code',
			key: 'projectShortCode',
			render: (project) => project.projectShortCode,
		},
		{
			header: 'Title',
			key: 'title',
			render: (project) => project.title,
		},
		{
			header: 'Created',
			key: 'creationDate',
			render: (project) => <DateDisplay date={project.creationDate} />,
		},
	]

	return (
		<main className="flex-1 overflow-auto">
			<div className="p-6">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-gray-900">
						Projects
					</h2>
					<button
						onClick={() => navigate(Route.newProject)}
						className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
					>
						New Project
					</button>
				</div>

				<Table
					data={data}
					columns={columns}
					onRowClick={(project) =>
						navigate(Route.viewProjectTestCases(project.projectShortCode))
					}
				/>
			</div>
		</main>
	)
}
