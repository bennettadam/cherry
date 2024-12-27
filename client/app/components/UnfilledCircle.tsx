import React from 'react'

interface UnfilledCircleProps {
	className?: string
}

const UnfilledCircle: React.FC<UnfilledCircleProps> = ({ className }) => {
	return (
		<svg
			className={className}
			width="100%"
			height="100%"
			viewBox="0 0 1024 1024"
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlnsXlink="http://www.w3.org/1999/xlink"
			style={{
				fillRule: 'evenodd',
				clipRule: 'evenodd',
				strokeLinejoin: 'round',
				strokeMiterlimit: 2,
			}}
		>
			<path d="M512,0C794.58,0 1024,229.42 1024,512C1024,794.58 794.58,1024 512,1024C229.42,1024 0,794.58 0,512C0,229.42 229.42,0 512,0ZM512,72C755.073,72 952,268.927 952,512C952,755.073 755.073,952 512,952C268.927,952 72,755.073 72,512C72,268.927 268.927,72 512,72Z" />
		</svg>
	)
}

export default UnfilledCircle
