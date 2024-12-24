import { type LoaderFunctionArgs } from '@remix-run/node'
import { Link, useNavigate, useOutletContext } from '@remix-run/react'
import { APIRoute } from '~/utility/Routes'
import {
	FetchResponse,
	ProjectTestCasesOutletContext,
	TestCase,
} from '~/models/types'
import { Table, type Column } from '~/components/Table'
import { DateDisplay } from '~/components/DateDisplay'

export async function loader({ params }: LoaderFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project ID is required', { status: 400 })
	}

	const response = await fetch(APIRoute.projectTestCases(projectShortCode), {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	})

	if (!response.ok) {
		throw new Response('Failed to fetch test cases', { status: 500 })
	}

	const testCases = (await response.json()) as FetchResponse<TestCase[]>

	return { testCases: testCases.data }
}

export default function TestCasesIndex() {
	const { project, testCases, properties } =
		useOutletContext<ProjectTestCasesOutletContext>()
	const navigate = useNavigate()

	// Find property configuration IDs for priority and type
	const priorityConfig = properties.find(
		(p) => p.title.toLowerCase() === 'priority'
	)
	const typeConfig = properties.find((p) => p.title.toLowerCase() === 'type')

	const columns: Column<TestCase>[] = [
		{
			header: 'ID',
			key: 'testCaseNumber',
			render: (testCase) =>
				`${project.projectShortCode}-${testCase.testCaseNumber}`,
		},
		{
			header: 'Title',
			key: 'title',
			render: (testCase) => testCase.title,
		},
		{
			header: 'Priority',
			key: 'priority',
			render: (testCase) =>
				priorityConfig
					? testCase.propertyValues[
							priorityConfig.propertyConfigurationID
					  ] || '-'
					: '-',
		},
		{
			header: 'Type',
			key: 'type',
			render: (testCase) =>
				typeConfig
					? testCase.propertyValues[typeConfig.propertyConfigurationID] ||
					  '-'
					: '-',
		},
		{
			header: 'Created',
			key: 'creationDate',
			render: (testCase) => <DateDisplay date={testCase.creationDate} />,
		},
	]

	return (
		<div>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-gray-900">Test Cases</h2>
				<Link
					to="new"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					New Test Case
				</Link>
			</div>

			<Table
				data={testCases}
				columns={columns}
				onRowClick={(testCase) =>
					navigate(testCase.testCaseNumber.toString())
				}
			/>
		</div>
	)
}
