import { Form, useSubmit } from '@remix-run/react'
import {
	PropertyConfiguration,
	PropertyType,
	TestCase,
	CreateTestCase,
} from '../models/types'
import { useState } from 'react'
import { useRef, useEffect } from 'react'
import { SelectDropdown } from './SelectDropdown'

export enum TestCaseFormMode {
	create,
	edit,
}

interface TestCaseFormProps {
	properties: PropertyConfiguration[]
	defaultValues?: TestCase
	mode: TestCaseFormMode
	onCancel: () => void
	onSubmit: (testCase: CreateTestCase) => void
}

export function TestCaseForm({
	properties,
	defaultValues = undefined,
	mode,
	onCancel,
	onSubmit,
}: TestCaseFormProps) {
	const submit = useSubmit()
	const [propertyValues, setPropertyValues] = useState<Record<string, string>>(
		defaultValues?.propertyValues ?? {}
	)

	const handlePropertyChange = (propertyID: string, value: string) => {
		setPropertyValues((prev) => ({
			...prev,
			[propertyID]: value,
		}))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)

		const testCase: CreateTestCase = {
			title: formData.get('title') as string,
			description: formData.get('description') as string,
			testInstructions: formData.get('testInstructions') as string,
			propertyValues,
		}

		onSubmit(testCase)
	}

	return (
		<Form method="post" className="space-y-6" onSubmit={handleSubmit}>
			{/* Title Field */}
			<div>
				<label
					htmlFor="title"
					className="block text-base font-semibold text-gray-700"
				>
					Title
				</label>
				<input
					type="text"
					name="title"
					id="title"
					defaultValue={defaultValues?.title}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					placeholder="Enter test case title"
				/>
			</div>

			{/* Description Field */}
			<div>
				<label
					htmlFor="description"
					className="block text-base font-semibold text-gray-700"
				>
					Description
				</label>
				<textarea
					name="description"
					id="description"
					rows={3}
					defaultValue={defaultValues?.description}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					placeholder="Enter test case description"
				/>
			</div>

			{/* Properties Section */}
			<div>
				<h3 className="block text-md font-semibold text-gray-700 mb-3">
					Properties
				</h3>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{properties.map((property) => (
						<div key={property.propertyConfigurationID}>
							<div className="text-sm font-medium text-gray-900">
								{property.title}
							</div>
							{property.propertyType === PropertyType.text && (
								<input
									type="text"
									value={
										propertyValues[
											property.propertyConfigurationID
										] ?? ''
									}
									onChange={(e) =>
										handlePropertyChange(
											property.propertyConfigurationID,
											e.target.value
										)
									}
									className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									placeholder={`Enter ${property.title}`}
								/>
							)}
							{property.propertyType === PropertyType.number && (
								<input
									type="number"
									value={
										propertyValues[
											property.propertyConfigurationID
										] ?? ''
									}
									onChange={(e) =>
										handlePropertyChange(
											property.propertyConfigurationID,
											e.target.value
										)
									}
									className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									placeholder={`Enter ${property.title}`}
								/>
							)}
							{property.propertyType === PropertyType.singleSelectList &&
								property.selectOptions && (
									<SelectDropdown
										options={property.selectOptions}
										value={
											propertyValues[
												property.propertyConfigurationID
											]
										}
										onChange={(value) =>
											handlePropertyChange(
												property.propertyConfigurationID,
												value
											)
										}
										placeholder={`Select ${property.title}`}
									/>
								)}
						</div>
					))}
				</div>
			</div>

			{/* Test Instructions Section */}
			<div>
				<label
					htmlFor="testInstructions"
					className="block text-base font-semibold text-gray-700"
				>
					Test Instructions
				</label>
				<div className="space-y-2">
					<textarea
						name="testInstructions"
						id="testInstructions"
						rows={5}
						defaultValue={defaultValues?.testInstructions}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						placeholder="1. Navigate to login page&#10;2. Enter credentials&#10;3. Click login button&#10;4. Verify dashboard is displayed"
					/>
					<p className="text-xs text-gray-500">
						Enter the instructions for the test
					</p>
				</div>
			</div>

			<div className="flex justify-end space-x-3">
				<button
					type="button"
					onClick={onCancel}
					className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</button>
				<button
					type="submit"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					{mode === TestCaseFormMode.create ? 'Create' : 'Update'}
				</button>
			</div>
		</Form>
	)
}
