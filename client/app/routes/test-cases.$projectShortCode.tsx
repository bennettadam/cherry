import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import ProjectSidebar from '~/components/Sidebar'
import {
	FetchResponse,
	ProjectTestCasesOutletContext,
	PropertyConfiguration,
	TestCase,
} from '~/models/types'
import { Project } from '~/models/project'
import { APIRoute, Route } from '~/utility/Routes'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project short code is required', { status: 400 })
	}

	const [projectResponse, testCasesResponse, propertiesResponse] =
		await Promise.all([
			fetch(APIRoute.projects, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}),
			fetch(APIRoute.projectTestCases(projectShortCode), {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}),
			await fetch(APIRoute.properties, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}),
		])

	if (!projectResponse.ok) {
		throw new Response('Failed to fetch project', { status: 500 })
	}
	if (!testCasesResponse.ok) {
		throw new Response('Failed to fetch test cases', { status: 500 })
	}
	if (!propertiesResponse.ok) {
		throw new Response('Failed to fetch properties', { status: 500 })
	}

	const projectData = (await projectResponse.json()) as FetchResponse<
		Project[]
	>
	const project = projectData.data.find(
		(project) => project.projectShortCode === projectShortCode
	)
	if (!project) {
		throw new Response('Project not found', { status: 404 })
	}

	const testCasesData = (await testCasesResponse.json()) as FetchResponse<
		TestCase[]
	>
	const propertiesData = (await propertiesResponse.json()) as FetchResponse<
		PropertyConfiguration[]
	>

	return {
		project,
		testCases: testCasesData.data,
		properties: propertiesData.data,
	}
}

export default function ProjectLayout() {
	const { project, testCases, properties } = useLoaderData<typeof loader>()

	const outletContext: ProjectTestCasesOutletContext = {
		project,
		testCases,
		properties,
	}

	return (
		<div className="flex">
			<ProjectSidebar
				projectShortCode={project.projectShortCode}
				title={project.name}
				description={project.description}
			/>
			<div className="flex-1 overflow-auto p-6">
				<Outlet context={outletContext} />
			</div>
		</div>
	)
}
