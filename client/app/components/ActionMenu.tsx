import { useState, useRef, useEffect } from 'react'
import { Link } from '@remix-run/react'

export interface ActionMenuItem {
	label: string
	action?: () => void
	href?: string
	variant?: 'default' | 'danger'
	reloadDocument?: boolean
}

interface ActionMenuProps {
	items: ActionMenuItem[]
	label?: string
}

export function ActionMenu({ items, label = 'Actions' }: ActionMenuProps) {
	const [isOpen, setIsOpen] = useState(false)
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleMenuItemClick = (action: () => void) => {
		action()
		setIsOpen(false)
	}

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				{label}
				<svg
					className="w-5 h-5 ml-2 -mr-1"
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
				<div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
					<div className="py-1" role="menu">
						{items.map((item) =>
							item.href ? (
								<Link
									key={item.label}
									to={item.href}
									reloadDocument={item.reloadDocument}
									className={`block w-full px-4 py-2 text-left text-sm ${
										item.variant === 'danger'
											? 'text-red-600'
											: 'text-gray-700'
									} hover:bg-gray-100`}
									role="menuitem"
								>
									{item.label}
								</Link>
							) : (
								<button
									key={item.label}
									onClick={() => handleMenuItemClick(item.action!)}
									className={`block w-full px-4 py-2 text-left text-sm ${
										item.variant === 'danger'
											? 'text-red-600'
											: 'text-gray-700'
									} hover:bg-gray-100`}
									role="menuitem"
								>
									{item.label}
								</button>
							)
						)}
					</div>
				</div>
			)}
		</div>
	)
}
