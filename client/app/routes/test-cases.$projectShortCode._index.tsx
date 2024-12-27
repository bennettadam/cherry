import { Link, useNavigate, useOutletContext } from '@remix-run/react'
import { ProjectTestCasesOutletContext, TestCase } from '~/models/types'
import { Table, type Column } from '~/components/Table'
import { DateDisplay } from '~/components/DateDisplay'

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
				tableRows={testCases.map((testCase) => ({
					id: testCase.testCaseID,
					data: testCase,
				}))}
				columns={columns}
				onRowClick={(testCase) =>
					navigate(testCase.testCaseNumber.toString())
				}
			/>
		</div>
	)
}
