import type { MetaFunction } from '@remix-run/node'

export const meta: MetaFunction = () => {
	return [
		{ title: 'Cherry' },
		{ name: 'Cherry', content: 'Welcome to Cherry' },
	]
}

export default function Index() {
	return (
		<div className="flex h-screen items-center justify-center">
			Cherry Test Platform
		</div>
	)
}
