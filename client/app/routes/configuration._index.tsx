import { type LoaderFunctionArgs } from '@remix-run/node'

export async function loader({}: LoaderFunctionArgs) {
	return {}
}

export default function Configuration() {
	return (
		<div className="p-6">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-900">
					Configuration
				</h2>
			</div>
			<div className="rounded-lg border border-gray-200 p-4">
				<p className="text-sm text-gray-500">
					Configuration settings will be added here.
				</p>
			</div>
		</div>
	)
}
