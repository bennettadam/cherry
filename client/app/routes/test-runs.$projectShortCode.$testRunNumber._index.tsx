import { type ActionFunctionArgs, redirect } from '@remix-run/node'
import { useNavigate, useSubmit, useOutletContext } from '@remix-run/react'
import { Route, APIRoute } from '~/utility/Routes'
import { ProjectTestCaseRunsOutletContext, TestRunStatus } from '~/models/types'
import type { UpdateTestRun } from '~/models/types'
import { ActionMenu, type ActionMenuItem } from '~/components/ActionMenu'
import { TestRunStatusBadge } from '~/components/TestRunStatusBadge'
import { TestCaseRunStatusBadge } from '~/components/TestCaseRunStatusBadge'
import { Table, type Column } from '~/components/Table'
import type { TestCaseRun } from '~/models/types'
import { Tools } from '~/utility/Tools'
import { BackButton } from '~/components/BackButton'

export async function action({ request, params }: ActionFunctionArgs) {
	const projectShortCode = params.projectShortCode
	if (!projectShortCode) {
		throw new Response('Project short code is required', { status: 400 })
	}

	const requestJSON = await request.json()

	if (requestJSON.intent === 'abort') {
		const { testRunUpdate, testRunID } = requestJSON
		const response = await fetch(APIRoute.testRun(testRunID), {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(testRunUpdate),
		})

		if (!response.ok) {
			throw new Response('Failed to abort test run', { status: 500 })
		}

		return redirect(Route.viewProjectTestRuns(projectShortCode))
	}

	if (requestJSON.intent === 'delete') {
		const { testRunID } = requestJSON
		const response = await fetch(APIRoute.testRun(testRunID), {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		if (!response.ok) {
			throw new Response('Failed to delete test run', { status: 500 })
		}

		return redirect(Route.viewProjectTestRuns(projectShortCode))
	}

	throw new Response('Invalid request', { status: 400 })
}

export default function TestRunDetails() {
	const { project, testRun, testCaseRuns } =
		useOutletContext<ProjectTestCaseRunsOutletContext>()

	const navigate = useNavigate()
	const submit = useSubmit()

	const menuItems: ActionMenuItem[] = (() => {
		const deleteItem: ActionMenuItem = {
			label: 'Delete test run',
			action: () => {
				if (
					window.confirm(
						'Are you sure you want to delete this test run? This action cannot be undone.'
					)
				) {
					submit(
						{ intent: 'delete', testRunID: testRun.testRunID },
						{
							method: 'POST',
							encType: 'application/json',
						}
					)
				}
			},
			variant: 'danger',
		}

		const editItem: ActionMenuItem = {
			label: 'Edit test run',
			action: () => {
				navigate('edit')
			},
		}

		switch (testRun.status) {
			case TestRunStatus.pending:
			case TestRunStatus.inProgress:
				return [
					{
						label: 'Abort test run',
						action: () => {
							const testRunUpdate: UpdateTestRun = {
								title: testRun.title,
								description: testRun.description,
								status: TestRunStatus.abort,
							}

							submit(
								{
									intent: 'abort',
									testRunUpdate,
									testRunID: testRun.testRunID,
								},
								{
									method: 'POST',
									encType: 'application/json',
								}
							)
						},
					},
					editItem,
					deleteItem,
				]
			case TestRunStatus.abort:
				return [
					{
						label: 'Resume test run',
						action: () => {
							const testRunUpdate: UpdateTestRun = {
								title: testRun.title,
								description: testRun.description,
								status: TestRunStatus.pending,
							}

							submit(
								{
									intent: 'abort',
									testRunUpdate,
									testRunID: testRun.testRunID,
								},
								{
									method: 'POST',
									encType: 'application/json',
								}
							)
						},
					},
					editItem,
					deleteItem,
				]
			case TestRunStatus.complete:
				return [editItem, deleteItem]
			default:
				return [editItem, deleteItem]
		}
	})()

	const columns: Column<TestCaseRun>[] = [
		{
			header: 'ID',
			key: 'id',
			render: (testCaseRun) =>
				Tools.testCaseDisplayCode(project, testCaseRun.testCase),
		},
		{
			header: 'Title',
			key: 'title',
			render: (testCaseRun) => testCaseRun.title,
		},
		{
			header: 'Status',
			key: 'status',
			render: (testCaseRun) => (
				<TestCaseRunStatusBadge status={testCaseRun.status} />
			),
		},
		{
			header: 'Created',
			key: 'created',
			render: (testCaseRun) =>
				new Date(testCaseRun.creationDate).toLocaleString(),
		},
	]

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<BackButton />
			</div>
			<div className="mb-6 flex justify-between items-start">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">
						{testRun.title}
					</h1>
					<div className="mt-4 grid grid-cols-2 gap-4">
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Status
							</h3>
							<TestRunStatusBadge status={testRun.status} />
						</div>
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-1">
								Description
							</h3>
							<p className="text-gray-700 mb-4">
								{testRun.description || 'No description provided'}
							</p>
						</div>
					</div>
				</div>
				<ActionMenu items={menuItems} label="Test Run Settings" />
			</div>

			<h3 className="text-lg font-medium text-gray-900 mb-4">Test Cases</h3>
			<Table
				data={testCaseRuns}
				columns={columns}
				onRowClick={(testCaseRun) =>
					navigate(testCaseRun.testCase.testCaseNumber.toString())
				}
			/>
		</div>
	)
}
