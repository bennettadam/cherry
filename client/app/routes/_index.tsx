import { json, type ActionFunctionArgs } from '@remix-run/node'
import {
	useLoaderData,
	useSubmit,
	Link,
	useFetcher,
	useNavigate,
} from '@remix-run/react'
import { useState, useEffect } from 'react'
import ProjectModal from '~/components/ProjectModal'
import type { FetchResponse, ErrorResponse } from '~/models/types'
import { APIRoute, Route } from '~/utility/Routes'
import { NewProject, Project } from '~/models/project'
import { Column, Table } from '~/components/Table'
import { DateDisplay } from '~/components/DateDisplay'

type ActionResponse = { error?: string }

export async function action({ request }: ActionFunctionArgs) {
	try {
		const response = await fetch(APIRoute.projects, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: await request.text(),
		})

		if (!response.ok) {
			const errorData = (await response.json()) as ErrorResponse
			throw new Error(errorData.message || 'Failed to create project')
		}

		return Response.json({})
	} catch (error) {
		return Response.json(
			{
				error:
					error instanceof Error
						? error.message
						: 'Failed to create project',
			},
			{ status: 400 }
		)
	}
}

export async function loader() {
	const response = await fetch(APIRoute.projects, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch properties', { status: 500 })
	}

	return (await response.json()) as FetchResponse<Project[]>
}

export default function Projects() {
	const navigate = useNavigate()
	const [isModalOpen, setIsModalOpen] = useState(false)
	const { data } = useLoaderData<typeof loader>()
	const fetcher = useFetcher<ActionResponse>()

	const handleCreateProject = (newProject: NewProject) => {
		fetcher.submit(newProject, {
			method: 'POST',
			encType: 'application/json',
		})
	}

	useEffect(() => {
		if (fetcher.state === 'idle' && !fetcher.data?.error) {
			setIsModalOpen(false)
		}
	}, [fetcher.state, fetcher.data])

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
						onClick={() => setIsModalOpen(true)}
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

				<ProjectModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSubmit={handleCreateProject}
					error={fetcher.data?.error}
				/>
			</div>
		</main>
	)
}
