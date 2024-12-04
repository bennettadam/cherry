import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import Sidebar from '~/components/Sidebar'
import { FetchResponse } from '../models/types'
import { Project } from '../models/project'
import { APIRoute } from '../utility/Routes'

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.projectID) {
		throw new Response('Project ID is required', { status: 400 })
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
		(project) => project.projectID === params.projectID
	)

	if (!project) {
		throw new Response('Project not found', { status: 404 })
	}

	return { project }
}

export default function ProjectLayout() {
	const { project } = useLoaderData<typeof loader>()

	return (
		<div className="flex h-full">
			<Sidebar
				title={project.name}
				description={project.description}
				items={[
					{ to: 'tests', label: 'Test Cases' },
					{ to: 'test-runs', label: 'Test Runs' },
				]}
			/>
			<div className="flex-1 overflow-auto">
				<Outlet />
			</div>
		</div>
	)
}
