import { Form, Link } from '@remix-run/react'
import { useState } from 'react'
import { PropertyType } from '~/models/types'
import { Route } from '~/utility/Routes'

export interface PropertyFormData extends Record<string, any> {
	name: string
	propertyType: PropertyType
	isRequired: boolean
	defaultValue?: string
	enumOptions?: string[]
}

interface PropertyFormProps {
	defaultValues?: PropertyFormData
	error?: string
	onSubmit: (data: PropertyFormData) => void
	submitLabel: string
}

export default function PropertyForm({
	defaultValues,
	error,
	onSubmit,
	submitLabel,
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
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
				/>
			</div>

			<div className="mb-6">
				<div className="flex items-center">
					<input
						type="checkbox"
						name="isRequired"
						id="isRequired"
						value="true"
						defaultChecked={defaultValues?.isRequired}
						className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
				<label
					htmlFor="propertyType"
					className="block text-sm font-medium text-gray-700"
				>
					Type
				</label>
				<select
					name="propertyType"
					id="propertyType"
					required
					className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					onChange={(e) => setSelectedType(e.target.value as PropertyType)}
					value={selectedType}
				>
					<option value={PropertyType.text}>Text</option>
					<option value={PropertyType.number}>Number</option>
					<option value={PropertyType.enum}>Enum</option>
				</select>
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
							className="rounded-md bg-indigo-600 px-2 py-1 text-sm font-medium text-white hover:bg-indigo-700"
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
								className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
						className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					/>
				)}
			</div>

			<div className="flex justify-end gap-4">
				<Link
					to={Route.viewProperties}
					className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Cancel
				</Link>
				<button
					type="submit"
					className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
				>
					{submitLabel}
				</button>
			</div>
		</Form>
	)
}
