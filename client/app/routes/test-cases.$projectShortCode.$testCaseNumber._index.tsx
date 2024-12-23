import { Link, useOutletContext } from '@remix-run/react'
import {
	ProjectTestCasesOutletContext,
	TestCaseOutletContext,
} from '~/models/types'

export default function TestCaseDetails() {
	const { testCase, propertyValues } =
		useOutletContext<TestCaseOutletContext>()

	return (
		<div>
			<div className="mb-6">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-gray-900">
						{testCase.title}
					</h2>
					<Link
						to="edit"
						className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
					>
						Edit Test Case
					</Link>
				</div>
				<div className="mt-2 flex flex-wrap items-center gap-4">
					<span className="text-sm text-gray-500">
						Test Case #{testCase.testCaseNumber}
					</span>
					<span className="text-sm text-gray-500">
						Created:{' '}
						{new Date(testCase.creationDate).toLocaleDateString()}
					</span>
				</div>
			</div>

			<div className="space-y-4">
				{testCase.description && (
					<div>
						<h3 className="text-lg font-medium text-gray-900">
							Description
						</h3>
						<p className="mt-2 text-gray-700">{testCase.description}</p>
					</div>
				)}

				<div>
					<h3 className="text-lg font-medium text-gray-900">Properties</h3>
					<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{propertyValues.map((propertyValue) => {
							return (
								<div
									key={
										propertyValue.propertyConfiguration
											.propertyConfigurationID
									}
									className="rounded-md border border-gray-200 p-3"
								>
									<div className="font-medium text-gray-900">
										{propertyValue.propertyConfiguration.title}
									</div>
									<div className="mt-1 text-sm text-gray-500">
										{propertyValue.value || 'Not set'}
									</div>
								</div>
							)
						})}
					</div>
				</div>

				{testCase.testInstructions && (
					<div>
						<h3 className="text-lg font-medium text-gray-900">
							Test Instructions
						</h3>
						<p className="mt-2 text-gray-700 whitespace-pre-wrap">
							{testCase.testInstructions}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
