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
	const buttonRef = useRef<HTMLButtonElement>(null)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			const target = event.target as Node
			const clickedButton = buttonRef.current?.contains(target)
			const clickedMenu = menuRef.current?.contains(target)

			if (!clickedButton && !clickedMenu) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	return (
		<div className="relative">
			<button
				ref={buttonRef}
				type="button"
				onClick={() => options.length > 0 && setIsOpen(!isOpen)}
				className={`text-left rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 ${
					options.length > 0
						? 'hover:bg-gray-100'
						: 'cursor-not-allowed bg-gray-50'
				} flex items-center justify-between shadow-sm`}
			>
				<span
					className={`px-1 ${!value ? 'text-gray-500' : 'text-gray-900'}`}
				>
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
			{isOpen && options.length > 0 && (
				<div
					ref={menuRef}
					className={`absolute z-10 mt-1 min-w-[200px] rounded-md bg-white shadow-lg border border-gray-200 overflow-hidden`}
				>
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
			{isOpen && options.length === 0 && (
				<div
					className={`absolute z-10 mt-1 min-w-[200px] rounded-md bg-white shadow-lg border border-gray-200 overflow-hidden`}
				>
					<div className="px-3 py-2 text-sm text-gray-500">
						No options available
					</div>
				</div>
			)}
		</div>
	)
}
