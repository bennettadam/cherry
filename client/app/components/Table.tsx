import { ReactNode } from 'react'
import { Checkbox } from './Checkbox'

export interface TableRow<T> {
	id: string
	data: T
	isSelected?: boolean
}

export type Column<T> = {
	header?: string
	key: string
	render: (item: T) => ReactNode
}

type TableProps<T> = {
	tableRows: TableRow<T>[]
	columns: Column<T>[]
	onRowClick?: (item: T) => void
	allowSelectAll?: boolean
}

export function Table<T>({ tableRows, columns, onRowClick, allowSelectAll }: TableProps<T>) {
	// compute if all rows are selected
	const allSelected = tableRows.length > 0 && tableRows.every((r) => r.isSelected)
	// toggle selection on every row
	const handleSelectAll = () => {
		tableRows.forEach((r) => {
			if (onRowClick && r.isSelected !== !allSelected) {
				onRowClick(r.data)
			}
		})
	}

	return (
		<div>
			<table className="min-w-full divide-y divide-gray-200">
				<thead>
					<tr>
						{columns.map((column, colIndex) => (
							<th
								key={column.key}
								className={`py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
									column.header ? '' : 'w-2'
								} ${colIndex === 0 && allowSelectAll ? 'px-2' : 'px-6'}`}
							>
								{colIndex === 0 && allowSelectAll ? (
									<button
										onClick={handleSelectAll}>
                    <Checkbox isSelected={allSelected} />
                  </button>
								) : (
									column.header
								)}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{tableRows.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length}
								className="px-6 py-4 text-sm text-gray-500 text-center"
							>
								No items to display yet
							</td>
						</tr>
					) : (
						tableRows.map((item, index) => (
							<tr
								key={index}
								onClick={() => onRowClick?.(item.data)}
								className={`hover:bg-gray-100 cursor-pointer rounded-lg ${
									item.isSelected === true ? 'bg-gray-100' : ''
								}`}
							>
								{columns.map((column, colIndex) => (
									<td
										key={`${column.key}-${index}`}
										className={`py-3 whitespace-nowrap text-sm font-medium text-gray-900 ${
											columns[colIndex].header ? 'px-6' : 'px-2'
										} ${colIndex === 0 ? 'rounded-l-xl' : ''} ${
											colIndex === columns.length - 1
												? 'rounded-r-xl'
												: ''
										}`}
									>
										{column.render(item.data)}
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
