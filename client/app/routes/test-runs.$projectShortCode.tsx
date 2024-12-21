import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import { Route, APIRoute } from '~/utility/Routes'
import { TestRun } from '~/models/types'
import type {
	FetchResponse,
	ProjectTestRunsOutletContext,
} from '~/models/types'
import ProjectSidebar from '../components/Sidebar'
import { Project } from '../models/project'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const [projectResponse, testRunsResponse] = await Promise.all([
		fetch(APIRoute.projects, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}),
		fetch(APIRoute.projectTestRuns(projectShortCode), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}),
	])

	if (!projectResponse.ok) {
		throw new Response('Failed to fetch project', { status: 500 })
	}

	if (!testRunsResponse.ok) {
		throw new Response('Failed to fetch test runs', { status: 500 })
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

	const testRunsData = (await testRunsResponse.json()) as FetchResponse<
		TestRun[]
	>

	return { project, testRuns: testRunsData.data }
}

export default function TestRunsIndex() {
	const { project, testRuns } = useLoaderData<typeof loader>()

	const outletContext: ProjectTestRunsOutletContext = {
		project,
		testRuns,
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
