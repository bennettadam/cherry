import { Link, useOutletContext, useNavigate } from '@remix-run/react'
import { ProjectTestRunsOutletContext, TestRun } from '~/models/types'
import { TestRunStatusBadge } from '~/components/TestRunStatusBadge'
import { Table, Column } from '~/components/Table'
import { DateDisplay } from '~/components/DateDisplay'

export default function TestRunsIndex() {
	const { testRuns } = useOutletContext<ProjectTestRunsOutletContext>()
	const navigate = useNavigate()

	const columns: Column<TestRun>[] = [
		{
			header: 'Title',
			key: 'title',
			render: (testRun) => testRun.title,
		},
		{
			header: 'Status',
			key: 'status',
			render: (testRun) => <TestRunStatusBadge status={testRun.status} />,
		},
		{
			header: 'Created',
			key: 'creationDate',
			render: (testRun) => <DateDisplay date={testRun.creationDate} />,
		},
	]

	return (
		<div>
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						Test Runs
					</h1>
				</div>

				<Link
					to="new"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					Create Test Run
				</Link>
			</div>
			<Table
				tableRows={testRuns.map((testRun) => ({
					id: testRun.testRunID,
					data: testRun,
				}))}
				columns={columns}
				onRowClick={(testRun) => navigate(testRun.testRunNumber.toString())}
			/>
		</div>
	)
}
