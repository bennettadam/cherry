interface DateDisplayProps {
	date: string | Date | number
	className?: string
}

export function DateDisplay({
	date,
	className = 'text-gray-500',
}: DateDisplayProps) {
	const formattedDate = new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
	return <span className={className}>{formattedDate}</span>
}
