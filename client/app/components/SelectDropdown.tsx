import { useEffect, useRef, useState } from 'react'

interface SelectDropdownProps {
	options: string[]
	value?: string
	onChange: (value: string) => void
	placeholder: string
}

export function SelectDropdown({
	options,
	value,
	onChange,
	placeholder,
}: SelectDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
			return () =>
				document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="mt-2 w-full text-left rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 hover:bg-gray-100 flex items-center justify-between shadow-sm"
			>
				<span className={`${!value ? 'text-gray-500' : 'text-gray-900'}`}>
					{value || placeholder}
				</span>
				<svg
					className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
						isOpen ? 'transform rotate-180' : ''
					}`}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</button>
			{isOpen && (
				<div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 overflow-hidden">
					<div className="max-h-60 overflow-auto">
						{options.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => {
									onChange(option)
									setIsOpen(false)
								}}
								className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
							>
								{option}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
