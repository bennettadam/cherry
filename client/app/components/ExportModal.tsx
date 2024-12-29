import { Link } from '@remix-run/react'
import { useState } from 'react'

export function ExportModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean
	onClose: () => void
}) {
	const exportOptions = [
		{
			value: 'PLAN',
			label: 'Test Plan',
			description:
				'Export a detailed plan including all test cases from this test run',
			exportPath: 'export?type=PLAN',
		},
		{
			value: 'RESULTS',
			label: 'Test Results',
			description: 'Export results and outcomes of this test run',
			exportPath: 'export?type=RESULTS',
		},
	]

	const [selectedOption, setSelectedOption] = useState(0)
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
			<div className="bg-white p-6 rounded-lg shadow-xl">
				<h2 className="text-xl font-semibold mb-4">Export Options</h2>
				<div className="space-y-3">
					{exportOptions.map((option, index) => (
						<button
							key={option.value}
							onClick={() => setSelectedOption(index)}
							className={`w-full p-4 rounded-lg border-2 text-left
								${
									selectedOption === index
										? 'border-sky-500 bg-sky-50'
										: 'border-gray-200 hover:border-gray-300'
								}`}
						>
							<div className="flex items-center">
								<div>
									<div className="font-medium">{option.label}</div>
									<div className="text-sm text-gray-500">
										{option.description}
									</div>
								</div>
							</div>
						</button>
					))}
				</div>
				<div className="flex gap-4 mt-4">
					<Link
						to={exportOptions[selectedOption].exportPath}
						reloadDocument
						onClick={onClose}
						className="flex-1 px-4 py-2 text-center bg-sky-600 text-white rounded-md hover:bg-sky-700"
					>
						Export
					</Link>
					<button
						onClick={onClose}
						className="flex-1 px-4 py-2 text-gray-600 border rounded-md hover:bg-gray-100"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	)
}
