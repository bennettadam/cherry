import { useState } from 'react'
import type { PropertyConfiguration, TestCase } from '~/models/types'

interface TestCaseSelectorProps {
	properties: PropertyConfiguration[]
	testCases: TestCase[]
	onDone: (selectedTestCases: TestCase[]) => void
	initialSelectedTestCases?: TestCase[]
}

export default function TestCaseSelector({
	properties,
	testCases,
	onDone,
	initialSelectedTestCases = [],
}: TestCaseSelectorProps) {
	const [searchQuery, setSearchQuery] = useState('')
	const [selectedFilters, setSelectedFilters] = useState<
		Record<string, string>
	>({})
	const [selectedPropertyIDs, setSelectedPropertyIDs] = useState<string[]>([])
	const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>(
		initialSelectedTestCases
	)

	const filteredTestCases = testCases.filter((testCase: TestCase) => {
		const matchesFilters = Object.entries(selectedFilters).every(
			([propertyID, value]) => {
				return testCase.propertyValues[propertyID] === value
			}
		)

		const matchesSearch = searchQuery
			? testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			  (testCase.description?.toLowerCase() || '').includes(
					searchQuery.toLowerCase()
			  )
			: true

		return matchesFilters && matchesSearch
	})

	const handleFilterChange = (propertyID: string, value: string) => {
		setSelectedFilters((prev) => ({
			...prev,
			[propertyID]: value,
		}))
	}

	const handleAddProperty = (propertyID: string) => {
		setSelectedPropertyIDs((prev) => [...prev, propertyID])
		setSelectedFilters((prev) => ({
			...prev,
			[propertyID]: '',
		}))
	}

	const handleRemoveProperty = (propertyID: string) => {
		setSelectedPropertyIDs((prev) => prev.filter((id) => id !== propertyID))
		setSelectedFilters((prev) => {
			const { [propertyID]: removed, ...rest } = prev
			return rest
		})
	}

	const handleToggleTestCase = (testCase: TestCase) => {
		setSelectedTestCases((prev) => {
			const isSelected = prev.some(
				(selected) => selected.testCaseID === testCase.testCaseID
			)
			if (isSelected) {
				return prev.filter(
					(selected) => selected.testCaseID !== testCase.testCaseID
				)
			}
			return [...prev, testCase]
		})
	}

	const availableProperties = properties.filter(
		(prop) => !selectedPropertyIDs.includes(prop.propertyConfigurationID)
	)

	return (
		<>
			<div className="mb-6">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Selected Test Cases: {selectedTestCases.length}
				</h2>
			</div>

			<div className="mb-4">
				<h2 className="text-lg font-medium text-gray-900 mb-2">
					Available Test Cases
				</h2>
				<div className="flex gap-4">
					<input
						type="text"
						placeholder="Search test cases..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					/>
					<select
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						onChange={(e) => {
							if (e.target.value) {
								handleAddProperty(e.target.value)
								e.target.value = ''
							}
						}}
						value=""
					>
						<option value="">Add Property Filter...</option>
						{availableProperties.map((property) => (
							<option
								key={property.propertyConfigurationID}
								value={property.propertyConfigurationID}
							>
								{property.title}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4 mb-6">
				{selectedPropertyIDs.map((propertyID) => {
					const property = properties.find(
						(p) => p.propertyConfigurationID === propertyID
					)!
					return (
						<div key={propertyID} className="relative">
							<div className="flex items-center justify-between mb-2">
								<label className="block text-sm font-medium text-gray-700">
									{property.title}
								</label>
								<button
									type="button"
									onClick={() => handleRemoveProperty(propertyID)}
									className="text-gray-400 hover:text-gray-500"
								>
									<span className="sr-only">Remove filter</span>
									<svg
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>
							<select
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
								onChange={(e) =>
									handleFilterChange(propertyID, e.target.value)
								}
								value={selectedFilters[propertyID] || ''}
							>
								<option value="">Any</option>
								{property.selectOptions?.map((option) => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					)
				})}
			</div>

			<div className="mb-6">
				<h2 className="text-lg font-medium text-gray-900 mb-4">
					Available Test Cases ({filteredTestCases.length})
				</h2>
				<div className="border rounded-md divide-y">
					{filteredTestCases.map((testCase) => {
						const isSelected = selectedTestCases.some(
							(selected) => selected.testCaseID === testCase.testCaseID
						)
						return (
							<div
								key={testCase.testCaseID}
								onClick={() => handleToggleTestCase(testCase)}
								className={`p-4 cursor-pointer hover:bg-gray-50 ${
									isSelected ? 'bg-sky-50' : ''
								}`}
							>
								<div>
									<h3 className="font-medium">{testCase.title}</h3>
									{testCase.description && (
										<p className="text-sm text-gray-600">
											{testCase.description}
										</p>
									)}
								</div>
							</div>
						)
					})}
					{filteredTestCases.length === 0 && (
						<div className="p-4 text-gray-500 text-sm">
							No test cases available
						</div>
					)}
				</div>
			</div>

			<div className="flex justify-end">
				<button
					onClick={() => onDone(selectedTestCases)}
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
				>
					Done
				</button>
			</div>
		</>
	)
}
