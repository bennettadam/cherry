import { ReactNode } from 'react'

export type Column<T> = {
	header: string
	key: string
	render: (item: T) => ReactNode
}

type TableProps<T> = {
	data: T[]
	columns: Column<T>[]
	onRowClick?: (item: T) => void
}

export function Table<T>({ data, columns, onRowClick }: TableProps<T>) {
	return (
		<div>
			<table className="min-w-full divide-y divide-gray-200">
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								key={column.key}
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								{column.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{data.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length}
								className="px-6 py-4 text-sm text-gray-500 text-center"
							>
								No items to display yet
							</td>
						</tr>
					) : (
						data.map((item, index) => (
							<tr
								key={index}
								onClick={() => onRowClick?.(item)}
								className="hover:bg-gray-100 cursor-pointer rounded-xl hover:rounded-xl"
							>
								{columns.map((column, colIndex) => (
									<td
										key={`${column.key}-${index}`}
										className={`px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 
											${colIndex === 0 ? 'first:rounded-l-xl' : ''} 
											${colIndex === columns.length - 1 ? 'last:rounded-r-xl' : ''}`}
									>
										{column.render(item)}
									</td>
								))}
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	)
}
