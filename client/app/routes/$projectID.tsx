import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import { projectStore } from '~/models/project.server'
import Sidebar from '~/components/Sidebar'

export async function loader({ params }: LoaderFunctionArgs) {
	if (!params.projectID) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const project = projectStore.getProject(params.projectID)

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
