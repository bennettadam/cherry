import Checkmark from './Checkmark'
import UnfilledCircle from './UnfilledCircle'

interface CheckboxProps {
	isSelected: boolean
}

export function Checkbox({ isSelected }: CheckboxProps) {
	return (
		isSelected 
			? <Checkmark className="h-5 w-5 fill-sky-600" /> 
			: <UnfilledCircle className="h-5 w-5 fill-gray-400" />
	)
}
