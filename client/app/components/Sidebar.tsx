import { NavLink } from '@remix-run/react'

interface SidebarProps {
	title: string
	description?: string
	items: Array<{
		to: string
		label: string
	}>
}

export default function Sidebar({ title, description, items }: SidebarProps) {
	return (
		<div className="w-64 border-r border-gray-200 bg-white">
			<div className="p-4">
				<h2 className="text-lg font-medium text-gray-900">{title}</h2>
				{description && (
					<p className="mt-1 text-sm text-gray-500 line-clamp-2">
						{description}
					</p>
				)}
			</div>
			<nav className="space-y-1 p-2">
				{items.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`block rounded-md px-3 py-2 text-sm font-medium ${
								isActive
									? 'bg-sky-50 text-sky-600'
									: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
							}`
						}
					>
						{item.label}
					</NavLink>
				))}
			</nav>
		</div>
	)
}
