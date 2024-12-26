import { PropertyConfiguration, PropertyType } from '../models/types'
import { SelectDropdown } from './SelectDropdown'
import { useState } from 'react'

const NOT_SET_VALUE = 'Not set'

interface PropertyInputProps {
	property: PropertyConfiguration
	initialValue?: string
	onChange: (value: string) => void
	onUnset: () => void
}

export const PropertyInput = ({
	property,
	initialValue,
	onChange,
	onUnset,
}: PropertyInputProps) => {
	const [internalValue, setInternalValue] = useState<string | undefined>(
		() => {
			if (
				property.propertyType === PropertyType.singleSelectList &&
				!property.isRequired &&
				!initialValue
			) {
				return NOT_SET_VALUE
			}
			return initialValue
		}
	)

	const actionWord =
		property.propertyType === PropertyType.singleSelectList
			? 'Select'
			: 'Enter'
	const placeholder = `${actionWord} ${property.title}${
		!property.isRequired ? ' (optional)' : ''
	}`

	const handleChange = (newValue: string) => {
		setInternalValue(newValue)
		if (newValue === NOT_SET_VALUE || newValue.trim() === '') {
			onUnset()
		} else {
			onChange(newValue)
		}
	}

	switch (property.propertyType) {
		case PropertyType.text:
			return (
				<input
					type="text"
					value={internalValue}
					onChange={(e) => handleChange(e.target.value)}
					className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					placeholder={placeholder}
				/>
			)
		case PropertyType.number:
			return (
				<input
					type="number"
					value={internalValue}
					onChange={(e) => handleChange(e.target.value)}
					className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
					placeholder={placeholder}
				/>
			)
		case PropertyType.singleSelectList:
			if (!property.selectOptions) return null

			const options = property.isRequired
				? property.selectOptions
				: [NOT_SET_VALUE, ...property.selectOptions]

			return (
				<SelectDropdown
					options={options}
					value={internalValue}
					onChange={handleChange}
					placeholder={placeholder}
				/>
			)
		default:
			return null
	}
}
