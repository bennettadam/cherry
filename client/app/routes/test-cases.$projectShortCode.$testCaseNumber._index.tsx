import { Link, useOutletContext } from '@remix-run/react'
import {
	ProjectTestCasesOutletContext,
	TestCaseOutletContext,
} from '~/models/types'
import { BackButton } from '~/components/BackButton'
import { DateDisplay } from '~/components/DateDisplay'

export default function TestCaseDetails() {
	const { project, testCase, propertyValues } =
		useOutletContext<TestCaseOutletContext>()

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<BackButton />
				<Link
					to="edit"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					Edit Test Case
				</Link>
			</div>
			<div className="mb-4">
				<div className="flex items-center gap-4">
					<h2 className="text-2xl font-semibold text-gray-900 flex items-center">
						{testCase.title}
					</h2>
					<span className="text-sm text-gray-500 flex items-center">
						{project.projectShortCode}-{testCase.testCaseNumber}
					</span>
				</div>
			</div>

			<div className="space-y-8">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
					<div>
						<label className="block text-base font-semibold text-gray-700">
							Created
						</label>
						<DateDisplay
							date={testCase.creationDate}
							className="mt-1 text-sm text-gray-700"
						/>
					</div>

					<div>
						<label className="block text-base font-semibold text-gray-700">
							Description
						</label>
						<div className="mt-1 text-sm text-gray-700">
							{testCase.description || 'No description provided'}
						</div>
					</div>
				</div>

				<div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						Properties
					</h3>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{propertyValues.map((propertyValue) => (
							<div
								key={
									propertyValue.propertyConfiguration
										.propertyConfigurationID
								}
							>
								<div className="text-sm font-medium text-gray-900">
									{propertyValue.propertyConfiguration.title}
								</div>
								<div className="mt-2 text-sm text-gray-700">
									{propertyValue.value || 'Not set'}
								</div>
							</div>
						))}
					</div>
				</div>

				<div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						Test Instructions
					</h3>
					<div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
						{testCase.testInstructions || 'No test instructions provided'}
					</div>
				</div>
			</div>
		</div>
	)
}
