import { TestRunStatus } from '~/models/types'

export function TestRunStatusBadge({ status }: { status: TestRunStatus }) {
	switch (status) {
		case TestRunStatus.pending:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-gray-100 text-gray-800">
					PENDING
				</span>
			)
		case TestRunStatus.abort:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-red-100 text-red-800">
					ABORTED
				</span>
			)
		case TestRunStatus.complete:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-green-100 text-green-800">
					COMPLETE
				</span>
			)
		case TestRunStatus.inProgress:
			return (
				<span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-blue-100 text-blue-800">
					IN PROGRESS
				</span>
			)
	}
}
