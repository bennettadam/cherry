import { type LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, Outlet } from '@remix-run/react'
import { APIRoute } from '~/utility/Routes'
import { TestRun } from '~/models/types'
import type {
	FetchResponse,
	ProjectTestRunsOutletContext,
} from '~/models/types'
import ProjectSidebar from '../components/ProjectSidebar'
import { Project } from '../models/project'
import { APIClient } from '~/utility/APIClient'
import { Tools } from '../utility/Tools'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project ID is required', { status: 400 })
	}

	try {
		const [projectData, testRunsData] = await Promise.all([
			APIClient.get<FetchResponse<Project[]>>(APIRoute.projects),
			APIClient.get<FetchResponse<TestRun[]>>(
				APIRoute.projectTestRuns(projectShortCode)
			),
		])

		const project = projectData.data.find(
			(project) => project.projectShortCode === projectShortCode
		)
		if (!project) {
			throw new Response('Project not found', { status: 404 })
		}

		return { project, testRuns: testRunsData.data }
	} catch (error) {
		throw new Response(JSON.stringify(Tools.mapErrorToResponse(error)), {
			status: 500,
		})
	}
}

export default function TestRunsIndex() {
	const { project, testRuns } = useLoaderData<typeof loader>()

	const outletContext: ProjectTestRunsOutletContext = {
		project,
		testRuns,
	}

	return (
		<div className="flex h-full">
			<ProjectSidebar
				projectShortCode={project.projectShortCode}
				title={project.title}
				description={project.description}
			/>
			<div className="flex-1 overflow-auto p-6">
				<Outlet context={outletContext} />
			</div>
		</div>
	)
}
