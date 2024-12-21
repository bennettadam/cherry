import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import Sidebar from '~/components/Sidebar'
import { FetchResponse } from '~/models/types'
import { Project } from '~/models/project'
import { APIRoute, Route } from '~/utility/Routes'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project short code is required', { status: 400 })
	}

	const response = await fetch(APIRoute.projects, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch properties', { status: 500 })
	}

	const projectData = (await response.json()) as FetchResponse<Project[]>
	const project = projectData.data.find(
		(project) => project.projectShortCode === projectShortCode
	)

	if (!project) {
		throw new Response('Project not found', { status: 404 })
	}

	return { project }
}

export default function ProjectLayout() {
	const { project } = useLoaderData<typeof loader>()

	return (
		<div className="flex">
			<Sidebar
				title={project.name}
				description={project.description}
				items={[
					{
						to: Route.viewTestCases(project.projectShortCode),
						label: 'Test Cases',
					},
					{ to: 'test-runs', label: 'Test Runs' },
				]}
			/>
			<div className="flex-1 overflow-auto p-6">
				<Outlet />
			</div>
		</div>
	)
}
