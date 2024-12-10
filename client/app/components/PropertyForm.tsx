import { Form, Link } from '@remix-run/react'
import { useState } from 'react'
import { PropertyConfiguration, PropertyType } from '~/models/types'
import { Route } from '~/utility/Routes'

export interface PropertyFormData extends Record<string, any> {
	name: string
	propertyType: PropertyType
	isRequired: boolean
	defaultValue?: string
	enumOptions?: string[]
}

interface PropertyFormProps {
	defaultValues?: PropertyConfiguration
	error?: string
	onSubmit: (data: PropertyFormData) => void
	submitLabel: string
	allowTypeEdit?: boolean
	onDelete?: () => void
}

export default function PropertyForm({
	defaultValues,
	error,
	onSubmit,
	submitLabel,
	allowTypeEdit = true,
	onDelete,
}: PropertyFormProps) {
	const [selectedType, setSelectedType] = useState<PropertyType>(
		defaultValues?.propertyType || PropertyType.text
	)
	const [enumOptions, setEnumOptions] = useState<string[]>(
		defaultValues?.enumOptions || ['']
	)

	const addOption = () => {
		setEnumOptions([...enumOptions, ''])
	}

	const updateOption = (index: number, value: string) => {
		const newOptions = [...enumOptions]
		newOptions[index] = value
		setEnumOptions(newOptions)
	}

	const deleteOption = (indexToDelete: number) => {
		if (enumOptions.length <= 1) return
		setEnumOptions(enumOptions.filter((_, index) => index !== indexToDelete))
	}

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const form = event.currentTarget

		const formData = new FormData(form)
		const data: PropertyFormData = {
			name: formData.get('name') as string,
			propertyType: formData.get('propertyType') as PropertyType,
			isRequired: formData.get('isRequired') === 'true',
			defaultValue: (formData.get('defaultValue') as string) || undefined,
			enumOptions:
				selectedType === PropertyType.enum
					? enumOptions
							.map((opt) => opt.trim())
							.filter((opt) => opt !== '')
					: undefined,
		}

		onSubmit(data)
	}

	return (
		<Form onSubmit={handleSubmit} className="max-w-2xl">
			{error && (
				<div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
					{error}
				</div>
			)}

			<div className="mb-6">
				<label
					htmlFor="name"
					className="block text-sm font-medium text-gray-700"
				>
					Name
				</label>
				<input
					type="text"
					name="name"
					id="name"
					required
					defaultValue={defaultValues?.name}
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
						defaultChecked={defaultValues?.required}
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
					<select
						name="propertyType"
						id="propertyType"
						required
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
						onChange={(e) =>
							setSelectedType(e.target.value as PropertyType)
						}
						value={selectedType}
					>
						<option value={PropertyType.text}>Text</option>
						<option value={PropertyType.number}>Number</option>
						<option value={PropertyType.enum}>Enum</option>
					</select>
				) : (
					<input
						type="text"
						readOnly
						value={selectedType}
						className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900"
					/>
				)}
			</div>

			{selectedType === PropertyType.enum && (
				<div className="mb-6 space-y-4">
					<div className="flex items-center justify-between">
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
					{enumOptions.map((option, index) => (
						<div key={index} className="flex gap-2">
							<input
								type="text"
								name={`propertyOptions[${index}]`}
								value={option}
								onChange={(e) => updateOption(index, e.target.value)}
								required
								placeholder={`Option ${index + 1}`}
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
							/>
							<button
								type="button"
								onClick={() => deleteOption(index)}
								disabled={enumOptions.length <= 1}
								className={`mt-1 rounded-md border px-2 ${
									enumOptions.length <= 1
										? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
										: 'border-red-300 text-red-600 bg-white hover:bg-red-50'
								}`}
							>
								×
							</button>
						</div>
					))}
				</div>
			)}

			<div className="mb-6">
				<label
					htmlFor="defaultValue"
					className="block text-sm font-medium text-gray-700"
				>
					Default Value
				</label>
				{selectedType === PropertyType.enum ? (
					<select
						name="defaultValue"
						id="defaultValue"
						defaultValue={defaultValues?.defaultValue}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					>
						<option value="">Select a default value</option>
						{enumOptions
							.filter((option) => option.trim() !== '')
							.map((option, index) => (
								<option key={index} value={option}>
									{option}
								</option>
							))}
					</select>
				) : (
					<input
						type="text"
						name="defaultValue"
						id="defaultValue"
						defaultValue={defaultValues?.defaultValue}
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					/>
				)}
			</div>

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
					to={Route.viewProperties}
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
