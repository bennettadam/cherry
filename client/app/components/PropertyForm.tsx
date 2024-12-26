import { Form, Link } from '@remix-run/react'
import { useState } from 'react'
import { PropertyConfiguration, PropertyType } from '~/models/types'
import { Route } from '~/utility/Routes'
import { SelectDropdown } from './SelectDropdown'
import { Tools } from '../utility/Tools'

export interface PropertyFormData extends Record<string, any> {
	title: string
	propertyType: PropertyType
	isRequired: boolean
	defaultValue?: string
	selectOptions?: string[]
}

interface PropertyFormProps {
	defaultValues?: PropertyConfiguration
	error?: string
	onSubmit: (data: PropertyFormData) => void
	submitLabel: string
	allowTypeEdit?: boolean
	onDelete?: () => void
}

// Change interface name
interface SelectOption {
	id: string
	value: string
}

const createInitialSelectState = (
	selectOptions?: string[],
	defaultValue?: string
): { options: SelectOption[]; defaultId?: string } => {
	if (!selectOptions?.length) {
		return {
			options: [{ id: crypto.randomUUID(), value: '' }],
			defaultId: undefined,
		}
	}

	const options = selectOptions.map((value) => ({
		id: crypto.randomUUID(),
		value,
	}))

	const defaultId = defaultValue
		? options.find((opt) => opt.value === defaultValue)?.id
		: undefined

	return { options, defaultId }
}

export default function PropertyForm({
	defaultValues,
	error,
	onSubmit,
	submitLabel,
	allowTypeEdit = true,
	onDelete,
}: PropertyFormProps) {
	const [
		{ options: selectOptions, defaultId: selectedDefaultValueId },
		setSelectState,
	] = useState(() =>
		createInitialSelectState(
			defaultValues?.selectOptions,
			defaultValues?.defaultValue
		)
	)

	// Rename setters
	const setSelectOptions = (newOptions: SelectOption[]) =>
		setSelectState((state) => ({ ...state, options: newOptions }))

	const setSelectedDefaultValueId = (newId: string | undefined) =>
		setSelectState((state) => ({ ...state, defaultId: newId }))

	const [selectedType, setSelectedType] = useState<PropertyType>(
		defaultValues?.propertyType || PropertyType.text
	)
	const [isRequired, setIsRequired] = useState<boolean>(
		defaultValues?.isRequired ?? false
	)
	const [textDefaultValue, setTextDefaultValue] = useState<string>(
		defaultValues?.defaultValue || ''
	)

	const addOption = () => {
		setSelectOptions([
			...selectOptions,
			{ id: crypto.randomUUID(), value: '' },
		])
	}

	const updateOption = (id: string, value: string) => {
		setSelectOptions(
			selectOptions.map((opt) => (opt.id === id ? { ...opt, value } : opt))
		)
	}

	const deleteOption = (idToDelete: string) => {
		if (selectOptions.length <= 1) return
		setSelectOptions(selectOptions.filter((opt) => opt.id !== idToDelete))

		// Clear the default value if the deleted option was selected
		if (idToDelete === selectedDefaultValueId) {
			setSelectedDefaultValueId(undefined)
		}
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget

		const formData = new FormData(form)
		const data: PropertyFormData = {
			title: formData.get('title') as string,
			propertyType: formData.get('propertyType') as PropertyType,
			isRequired: formData.get('isRequired') === 'true',
			defaultValue: getDefaultValueForType(),
			selectOptions:
				selectedType === PropertyType.singleSelectList
					? selectOptions
							.filter((opt) => opt.value.trim() !== '')
							.map((opt) => opt.value)
					: undefined,
		}

		onSubmit(data)
	}

	const getDefaultValueForType = () => {
		switch (selectedType) {
			case PropertyType.singleSelectList:
				return selectOptions.find(
					(opt) => opt.id === selectedDefaultValueId
				)?.value
			case PropertyType.text:
			case PropertyType.number:
				return textDefaultValue || undefined
			default:
				return undefined
		}
	}

	const renderDefaultValueInput = () => {
		switch (selectedType) {
			case PropertyType.singleSelectList:
				return (
					<SelectDropdown
						options={getDefaultValueOptions()}
						value={getCurrentDefaultValue()}
						onChange={handleDefaultValueChange}
						placeholder={
							isRequired
								? 'Select a default value'
								: 'Select a default value (optional)'
						}
					/>
				)
			case PropertyType.text:
				return (
					<input
						type="text"
						value={textDefaultValue}
						onChange={(e) => setTextDefaultValue(e.target.value)}
						placeholder={
							isRequired
								? 'Enter default value'
								: 'Enter default value (optional)'
						}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				)
			case PropertyType.number:
				return (
					<input
						type="number"
						value={textDefaultValue}
						onChange={(e) => setTextDefaultValue(e.target.value)}
						placeholder={
							isRequired
								? 'Enter default value'
								: 'Enter default value (optional)'
						}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				)
			default:
				return null
		}
	}

	const handleRequiredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newIsRequired = e.target.checked
		setIsRequired(newIsRequired)

		if (
			newIsRequired &&
			selectedDefaultValueId === undefined &&
			selectedType === PropertyType.singleSelectList
		) {
			const firstValidOption = selectOptions.find(
				(opt) => opt.value.trim() !== ''
			)
			setSelectedDefaultValueId(firstValidOption?.id)
		}
	}

	const propertyTypeOptions = [
		{
			value: PropertyType.text,
			label: Tools.propertyTypeToDisplayText(PropertyType.text),
		},
		{
			value: PropertyType.number,
			label: Tools.propertyTypeToDisplayText(PropertyType.number),
		},
		{
			value: PropertyType.singleSelectList,
			label: Tools.propertyTypeToDisplayText(PropertyType.singleSelectList),
		},
	]

	const getDefaultValueOptions = () => {
		const validSelectOptions = selectOptions
			.filter((opt) => opt.value.trim() !== '')
			.map((opt) => opt.value)

		return isRequired
			? validSelectOptions
			: ['No default value', ...validSelectOptions]
	}

	const getCurrentDefaultValue = () => {
		if (selectedDefaultValueId === undefined) {
			return isRequired ? '' : 'No default value'
		}

		return (
			selectOptions.find((opt) => opt.id === selectedDefaultValueId)
				?.value || ''
		)
	}

	const handleDefaultValueChange = (value: string) => {
		if (value === 'No default value') {
			setSelectedDefaultValueId(undefined)
			return
		}

		const selectedOption = selectOptions.find((opt) => opt.value === value)
		setSelectedDefaultValueId(selectedOption?.id)
	}

	return (
		<Form onSubmit={handleSubmit}>
			{error && (
				<div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
					{error}
				</div>
			)}

			<div className="mb-6">
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-700"
				>
					Name
				</label>
				<input
					type="text"
					name="title"
					id="title"
					required
					defaultValue={defaultValues?.title}
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
				/>
			</div>

			<div className="mb-6">
				<div className="flex items-center">
					<input
						type="checkbox"
						name="isRequired"
						id="isRequired"
						value="true"
						checked={isRequired}
						onChange={handleRequiredChange}
						className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
					/>
					<label
						htmlFor="isRequired"
						className="ml-2 block text-sm font-medium text-gray-700"
					>
						Required
					</label>
				</div>
			</div>

			<div className="mb-6">
				<div className="flex items-center gap-1">
					<label
						htmlFor="propertyType"
						className="block text-sm font-medium text-gray-700"
					>
						Type
					</label>
					{!allowTypeEdit && (
						<div className="group relative">
							<span className="cursor-help text-gray-400">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-5 h-5"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-.75 1.5-.75a1.5 1.5 0 10-1.81-2.385zM10 15a1 1 0 100-2 1 1 0 000 2z"
										clipRule="evenodd"
									/>
								</svg>
							</span>
							<div className="absolute left-full top-1/2 ml-2 hidden w-64 -translate-y-1/2 rounded-md bg-gray-900 px-3 py-1 text-sm text-white group-hover:block z-10">
								To change the type, delete this property and create a
								new one
								<div className="absolute left-0 top-1/2 -ml-1 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
							</div>
						</div>
					)}
				</div>
				{allowTypeEdit ? (
					<>
						<input
							type="hidden"
							name="propertyType"
							value={selectedType}
						/>
						<SelectDropdown
							options={propertyTypeOptions.map((opt) => opt.label)}
							value={
								propertyTypeOptions.find(
									(opt) => opt.value === selectedType
								)?.label
							}
							onChange={(label) => {
								const option = propertyTypeOptions.find(
									(opt) => opt.label === label
								)
								if (option) {
									setSelectedType(option.value)
								}
							}}
							placeholder="Select a type"
						/>
					</>
				) : (
					<input
						type="text"
						readOnly
						value={Tools.propertyTypeToDisplayText(selectedType)}
						className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
					/>
				)}
			</div>

			{selectedType === PropertyType.singleSelectList ? (
				<div className="mb-6">
					<div className="flex gap-6">
						<div className="flex-1">
							<div className="flex items-center mb-2">
								<div className="flex flex-grow items-center justify-between gap-4">
									<label className="block text-sm font-medium text-gray-700">
										Options
									</label>
									<button
										type="button"
										onClick={addOption}
										className="rounded-md bg-sky-600 px-2 py-1 text-sm font-medium text-white hover:bg-sky-700"
									>
										+ Add Option
									</button>
								</div>
							</div>
							<div className="divide-y divide-gray-300">
								{selectOptions.map((option, index) => (
									<div key={option.id} className="flex items-center">
										<div className="flex flex-grow items-center hover:bg-gray-50 hover:rounded-xl focus-within:bg-gray-50 focus-within:rounded-xl m-0.5">
											<div className="flex-grow">
												<input
													type="text"
													value={option.value}
													onChange={(e) =>
														updateOption(
															option.id,
															e.target.value
														)
													}
													required
													placeholder={`Option ${index + 1}`}
													className="w-full border-0 px-4 py-2 focus:ring-0 focus:outline-none bg-transparent"
												/>
											</div>
											<button
												type="button"
												onClick={() => deleteOption(option.id)}
												disabled={selectOptions.length <= 1}
												className={`mr-4 p-1 rounded-md ${
													selectOptions.length <= 1
														? 'text-gray-400 cursor-not-allowed'
														: 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
												}`}
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="w-4 h-4"
												>
													<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
												</svg>
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="w-64">
							<div className="mb-2">
								<label className="block text-sm font-medium text-gray-700">
									Default Value
								</label>
							</div>
							{renderDefaultValueInput()}
						</div>
					</div>
				</div>
			) : (
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700">
						Default Value
					</label>
					{renderDefaultValueInput()}
				</div>
			)}

			<div className="flex justify-end gap-4">
				{onDelete && (
					<button
						type="button"
						onClick={onDelete}
						className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
					>
						Delete
					</button>
				)}
				<Link
					to=".."
					className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</Link>
				<button
					type="submit"
					className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
				>
					{submitLabel}
				</button>
			</div>
		</Form>
	)
}
