import React from 'react'

interface CheckmarkProps {
	className?: string
}

const Checkmark: React.FC<CheckmarkProps> = ({ className }) => {
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
			<g transform="matrix(1.25464,0,0,1.25464,-258.037,-260.752)">
				<circle cx="613.751" cy="615.915" r="408.085" />
			</g>
			<g transform="matrix(1,0,0,1,-1.70746,-1.40638e-07)">
				<g transform="matrix(0.7514,-0.7514,0.500001,0.500001,-127.254,508.026)">
					<path
						d="M286.862,415.573C286.862,392.157 274.212,373.147 258.631,373.147L220.989,373.147C205.407,373.147 192.757,392.157 192.757,415.573L192.757,740.028C192.757,763.444 205.407,782.455 220.989,782.455L258.631,782.455C274.212,782.455 286.862,763.444 286.862,740.028L286.862,415.573Z"
						style={{ fill: 'white' }}
					/>
				</g>
				<g transform="matrix(-0.7514,-0.7514,1.01176,-1.01176,176.438,1276.79)">
					<path
						d="M286.862,394.113C286.862,382.542 274.212,373.147 258.631,373.147L220.989,373.147C205.407,373.147 192.757,382.542 192.757,394.113L192.757,761.488C192.757,773.06 205.407,782.455 220.989,782.455L258.631,782.455C274.212,782.455 286.862,773.06 286.862,761.488L286.862,394.113Z"
						style={{ fill: 'white' }}
					/>
				</g>
			</g>
		</svg>
	)
}

export default Checkmark
