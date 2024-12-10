import { useEffect, useRef } from 'react'

export type TestCasePriority = 'critical' | 'high' | 'medium' | 'low'
export type TestCaseType =
	| 'other'
	| 'functional'
	| 'smoke'
	| 'regression'
	| 'security'
	| 'acceptance'
	| 'compatibility'
	| 'exploratory'

type FieldType = 'text' | 'textarea' | 'select'

interface SelectOption {
	value: string
	label: string
}

interface FormField {
	name: string
	label: string
	type: FieldType
	required?: boolean
	options?: SelectOption[]
}

interface TestCaseModalProps {
	isOpen: boolean
	onClose: () => void
	onSubmit: (data: Record<string, string> & { steps: string }) => void
	fields: FormField[]
	title: string
}

export default function TestCaseModal({
	isOpen,
	onClose,
	onSubmit,
	fields,
	title,
}: TestCaseModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (isOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}
	}, [isOpen])

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const data: Record<string, string> = {}

		fields.forEach((field) => {
			data[field.name] = formData.get(field.name) as string
		})

		onSubmit({
			...data,
			steps: formData.get('steps') as string,
		})
	}

	const renderField = (field: FormField) => {
		const baseClasses =
			'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'

		switch (field.type) {
			case 'textarea':
				return (
					<textarea
						name={field.name}
						id={field.name}
						rows={3}
						required={field.required}
						className={baseClasses}
					/>
				)
			case 'select':
				return (
					<select
						name={field.name}
						id={field.name}
						required={field.required}
						className={baseClasses}
					>
						{field.options?.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				)
			default:
				return (
					<input
						type="text"
						name={field.name}
						id={field.name}
						required={field.required}
						className={baseClasses}
					/>
				)
		}
	}

	return (
		<dialog
			ref={dialogRef}
			className="rounded-lg p-0 backdrop:bg-gray-500/50"
			onClose={onClose}
			onClick={(e) => {
				if (e.target === dialogRef.current) {
					onClose()
				}
			}}
		>
			<div className="min-w-[600px] p-6">
				<h2 className="text-lg font-medium text-gray-900">{title}</h2>
				<form onSubmit={handleSubmit} className="mt-4">
					<div className="space-y-4">
						{fields.map((field) => (
							<div key={field.name}>
								<label
									htmlFor={field.name}
									className="block text-sm font-medium text-gray-700"
								>
									{field.label}
								</label>
								{renderField(field)}
							</div>
						))}

						{/* Built-in Steps Section */}
						<div>
							<label
								htmlFor="steps"
								className="block text-sm font-medium text-gray-700"
							>
								Test Steps
							</label>
							<div className="space-y-2">
								<textarea
									name="steps"
									id="steps"
									rows={5}
									required
									className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
									placeholder="1. Navigate to login page&#10;2. Enter credentials&#10;3. Click login button&#10;4. Verify dashboard is displayed"
								/>
								<p className="text-xs text-gray-500">
									Enter each step on a new line, numbered sequentially
								</p>
							</div>
						</div>
					</div>

					<div className="mt-6 flex justify-end space-x-3">
						<button
							type="button"
							onClick={onClose}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
						>
							Create
						</button>
					</div>
				</form>
			</div>
		</dialog>
	)
}
