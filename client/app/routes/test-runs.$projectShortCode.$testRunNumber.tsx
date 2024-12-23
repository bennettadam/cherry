import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	useLoaderData,
	Outlet,
	useOutletContext,
	useParams,
} from '@remix-run/react'
import { Route, APIRoute } from '~/utility/Routes'
import type {
	FetchResponse,
	ProjectTestCaseRunsOutletContext,
	ProjectTestRunsOutletContext,
	TestCaseRun,
} from '~/models/types'
import ProjectSidebar from '../components/ProjectSidebar'
import { Project } from '../models/project'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	const testRunNumber = Number(params.testRunNumber)
	if (!projectShortCode) {
		throw new Response('Project ID is required', { status: 400 })
	}
	if (!testRunNumber) {
		throw new Response('Test run number is required', { status: 400 })
	}

	const response = await fetch(
		APIRoute.projectTestCaseRuns(projectShortCode, testRunNumber),
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	)

	if (!response.ok) {
		throw new Response('Failed to fetch test run', { status: 500 })
	}

	const testCaseRuns = (await response.json()) as FetchResponse<TestCaseRun[]>
	return { testRunNumber, testCaseRuns: testCaseRuns.data }
}

export default function TestRunsIndex() {
	const { testRunNumber, testCaseRuns } = useLoaderData<typeof loader>()
	const { project, testRuns } =
		useOutletContext<ProjectTestRunsOutletContext>()
	const testRun = testRuns.find(
		(testRun) => testRun.testRunNumber === testRunNumber
	)
	if (!testRun) {
		return <p>Test run not found</p>
	}

	const outletContext: ProjectTestCaseRunsOutletContext = {
		project,
		testRun,
		testCaseRuns,
	}

	return <Outlet context={outletContext} />
}
